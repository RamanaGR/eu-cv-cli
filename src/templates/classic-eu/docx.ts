import {
  AlignmentType,
  BorderStyle,
  Document,
  Paragraph,
  TextRun,
} from 'docx';
import type { ResumeData } from '../../schema/resume.schema.js';
import {
  CHARCOAL,
  buildEuBanner,
  contactLine,
  createDocDocument,
  photoParagraph,
  standardSections,
} from '../shared/docx-common.js';

export async function renderClassicEuDocx(
  data: ResumeData,
  photoBuffer?: Buffer | null,
): Promise<Document> {
  const children = [];

  const photo = photoParagraph(photoBuffer, { width: 70, height: 88 });
  if (photo) children.push(photo);

  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.basics.name.toUpperCase(),
          bold: true,
          size: 32,
          font: 'Georgia',
          color: CHARCOAL,
        }),
      ],
    }),
  );

  if (data.basics.label) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: data.basics.label,
            size: 20,
            font: 'Calibri',
            color: '334155',
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: CHARCOAL, space: 6 },
      },
      children: [
        new TextRun({
          text: contactLine(data),
          size: 16,
          font: 'Calibri',
          color: '64748B',
        }),
      ],
    }),
  );

  children.push(...buildEuBanner(data));
  children.push(...standardSections(data, CHARCOAL));

  return createDocDocument(children);
}
