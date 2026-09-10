import type { Document } from 'docx';
import type { ResumeData } from '../schema/resume.schema.js';

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  renderHtml(data: ResumeData, photoDataUrl?: string | null): Promise<string>;
  renderDocx(data: ResumeData, photoBuffer?: Buffer | null): Promise<Document>;
}
