import type { ResumeData } from '../../schema/resume.schema.js';

/** View model for cover-letter HTML / DOCX (not a Zod resume schema). */
export interface CoverLetterView {
  basics: ResumeData['basics'];
  company: string;
  role: string;
  opening: string;
  bullets: [string, string];
  closing: string;
}
