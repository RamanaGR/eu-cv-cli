import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import type { Document } from 'docx';
import { registerHelpers } from '../shared/register-helpers.js';
import { renderCoverLetterDocx } from './docx.js';
import type { CoverLetterView } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function renderCoverLetterHtml(view: CoverLetterView): Promise<string> {
  registerHelpers();
  const source = await readFile(path.join(__dirname, 'template.html'), 'utf8');
  const template = Handlebars.compile(source);
  return template(view);
}

export async function renderCoverLetterDocxDocument(
  view: CoverLetterView,
): Promise<Document> {
  return renderCoverLetterDocx(view);
}
