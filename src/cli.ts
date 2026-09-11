#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Command } from 'commander';
import { parseResume } from './schema/resume.schema.js';
import { getTemplate, listTemplates } from './templates/index.js';
import { renderPdf } from './core/pdf-renderer.js';
import { renderDocx } from './core/docx-renderer.js';
import { filenameSlug } from './utils/formatters.js';
import { resolvePhoto, toDataUrl, toImageBuffer } from './utils/photo.js';

const program = new Command();

program
  .name('eu-cv')
  .description('Generate A4 PDF and DOCX CVs from resume JSON for European tech hiring')
  .option('-i, --input <path>', 'Path to resume JSON', './resume.json')
  .option(
    '-t, --template <id>',
    'Template id (omit to choose interactively)',
  )
  .option('-f, --format <list>', 'Comma-separated formats: pdf,docx', 'pdf,docx')
  .option('-o, --outdir <path>', 'Output directory', './output')
  .option('--no-photo', 'Omit profile photo even if basics.image is set')
  .addHelpText(
    'after',
    () =>
      `\nTemplates:\n${listTemplates()
        .map((t) => `  ${t.id.padEnd(18)} ${t.description}`)
        .join('\n')}\n\nExamples:\n  npm run generate -- -t tech-modern\n  npm run generate -- -t tech-modern --no-photo\n  npm run generate -- -t classic-eu -f pdf\n  npm run generate\n`,
  );

program.parse();

const opts = program.opts<{
  input: string;
  template?: string;
  format: string;
  outdir: string;
  /** false when `--no-photo` is passed (Commander `--no-*` convention) */
  photo: boolean;
}>();

async function promptTemplateId(): Promise<string> {
  const templates = listTemplates();

  if (!input.isTTY) {
    throw new Error(
      `No --template provided and stdin is not interactive. Pass one of: ${templates
        .map((t) => t.id)
        .join(', ')}`,
    );
  }

  console.log('\nSelect a template:\n');
  templates.forEach((t, i) => {
    console.log(`  ${i + 1}) ${t.id.padEnd(18)} ${t.name}`);
  });
  console.log('');

  const rl = createInterface({ input, output });
  try {
    while (true) {
      const answer = (await rl.question(`Enter number (1-${templates.length}) or template id: `)).trim();
      const asIndex = Number(answer);
      if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= templates.length) {
        return templates[asIndex - 1]!.id;
      }
      if (templates.some((t) => t.id === answer)) {
        return answer;
      }
      console.log(`Invalid choice. Use 1-${templates.length} or an id: ${templates.map((t) => t.id).join(', ')}`);
    }
  } finally {
    rl.close();
  }
}

async function resolveTemplateId(requested?: string): Promise<string> {
  if (requested?.trim()) {
    getTemplate(requested.trim()); // validate early
    return requested.trim();
  }
  return promptTemplateId();
}

async function main(): Promise<void> {
  const inputPath = path.resolve(opts.input);
  const outdir = path.resolve(opts.outdir);
  const formats = opts.format
    .split(',')
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);

  if (!formats.length) {
    throw new Error('At least one format required (pdf and/or docx)');
  }
  for (const f of formats) {
    if (f !== 'pdf' && f !== 'docx') {
      throw new Error(`Unsupported format "${f}". Use pdf and/or docx.`);
    }
  }

  const templateId = await resolveTemplateId(opts.template);
  const template = getTemplate(templateId);

  const raw = JSON.parse(await readFile(inputPath, 'utf8')) as unknown;
  const data = parseResume(raw);

  const resumeDir = path.dirname(inputPath);
  const omitPhoto = opts.photo === false;
  const photo = omitPhoto
    ? null
    : await resolvePhoto(data.basics.image, resumeDir);
  const photoDataUrl = photo ? toDataUrl(photo) : null;
  const photoBuffer = photo ? toImageBuffer(photo) : null;

  const baseName = omitPhoto
    ? `${filenameSlug(data.basics.name)}_CV_${template.id}_nophoto`
    : `${filenameSlug(data.basics.name)}_CV_${template.id}`;
  const written: string[] = [];

  if (formats.includes('pdf')) {
    const html = await template.renderHtml(data, photoDataUrl);
    const pdfPath = path.join(outdir, `${baseName}.pdf`);
    await renderPdf(html, pdfPath);
    written.push(pdfPath);
  }

  if (formats.includes('docx')) {
    const doc = await template.renderDocx(data, photoBuffer);
    const docxPath = path.join(outdir, `${baseName}.docx`);
    await renderDocx(doc, docxPath);
    written.push(docxPath);
  }

  console.log(`\nGenerated with template "${template.id}":`);
  for (const file of written) {
    console.log(`  ${file}`);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
});
