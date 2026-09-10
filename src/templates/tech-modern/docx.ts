import {
  Document,
  Paragraph,
  TextRun,
} from 'docx';
import type { ResumeData } from '../../schema/resume.schema.js';
import {
  NAVY,
  buildEuBanner,
  contactLine,
  createDocDocument,
  photoParagraph,
  standardSections,
} from '../shared/docx-common.js';

export async function renderTechModernDocx(
  data: ResumeData,
  photoBuffer?: Buffer | null,
): Promise<Document> {
  const children = [];

  const photo = photoParagraph(photoBuffer, { width: 90, height: 90 });

  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.basics.name,
          bold: true,
          size: 36,
          font: 'Calibri',
          color: NAVY,
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
            size: 22,
            font: 'Calibri',
            color: '475569',
          }),
        ],
      }),
    );
  }

  if (photo) children.push(photo);

  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: contactLine(data),
          size: 17,
          font: 'Calibri',
          color: '64748B',
        }),
      ],
    }),
  );

  children.push(...buildEuBanner(data));
  children.push(...standardSections(data, NAVY));

  return createDocDocument(children);
}
