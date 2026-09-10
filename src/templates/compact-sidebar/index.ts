import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import type { Document } from 'docx';
import type { ResumeData } from '../../schema/resume.schema.js';
import type { CVTemplate } from '../types.js';
import { registerHelpers } from '../shared/register-helpers.js';
import { renderCompactSidebarDocx } from './docx.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const compactSidebarTemplate: CVTemplate = {
  id: 'compact-sidebar',
  name: 'Compact Sidebar',
  description:
    'Two-column print layout with photo, skills, languages, and EU meta in the left sidebar — dense senior profiles.',

  async renderHtml(data: ResumeData, photoDataUrl?: string | null): Promise<string> {
    registerHelpers();
    const source = await readFile(path.join(__dirname, 'template.html'), 'utf8');
    const template = Handlebars.compile(source);
    return template({ ...data, photoDataUrl: photoDataUrl ?? null });
  },

  async renderDocx(data: ResumeData, photoBuffer?: Buffer | null): Promise<Document> {
    return renderCompactSidebarDocx(data, photoBuffer);
  },
};
