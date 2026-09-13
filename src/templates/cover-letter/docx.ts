import {
  BorderStyle,
  Document,
  Paragraph,
  TextRun,
} from 'docx';
import {
  CHARCOAL,
  MUTED,
  NAVY,
  bodyParagraph,
  bullet,
  contactLine,
  createDocDocument,
} from '../shared/docx-common.js';
import type { CoverLetterView } from './types.js';
import type { ResumeData } from '../../schema/resume.schema.js';

export async function renderCoverLetterDocx(view: CoverLetterView): Promise<Document> {
  const data = { basics: view.basics } as ResumeData;
  const children = [];

  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: view.basics.name,
          bold: true,
          size: 36,
          font: 'Calibri',
          color: NAVY,
        }),
      ],
    }),
  );

  if (view.basics.label) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: view.basics.label,
            size: 22,
            font: 'Calibri',
            color: '475569',
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { after: 160 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 18, color: NAVY, space: 6 },
      },
      children: [
        new TextRun({
          text: contactLine(data),
          size: 17,
          font: 'Calibri',
          color: MUTED,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: 'Re: ',
          bold: true,
          size: 20,
          font: 'Calibri',
          color: NAVY,
        }),
        new TextRun({
          text: `${view.role} — ${view.company}`,
          size: 20,
          font: 'Calibri',
          color: '475569',
        }),
      ],
    }),
  );

  children.push(bodyParagraph('Dear Hiring Manager,'));
  children.push(bodyParagraph(view.opening));
  children.push(
    bodyParagraph('In particular, the following experience aligns closely with this role:'),
  );
  children.push(bullet(view.bullets[0]));
  children.push(bullet(view.bullets[1]));
  children.push(bodyParagraph(view.closing));

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({
          text: 'Sincerely,',
          size: 20,
          font: 'Calibri',
          color: CHARCOAL,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { before: 160 },
      children: [
        new TextRun({
          text: view.basics.name,
          bold: true,
          size: 20,
          font: 'Calibri',
          color: NAVY,
        }),
      ],
    }),
  );

  return createDocDocument(children);
}
