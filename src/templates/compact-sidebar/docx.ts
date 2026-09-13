import {
  Document,
  Paragraph,
  TextRun,
  ShadingType,
} from 'docx';
import type { ResumeData } from '../../schema/resume.schema.js';
import { formatDateRange, joinList } from '../../utils/formatters.js';
import {
  CHARCOAL,
  MUTED,
  NAVY,
  bodyParagraph,
  bullet,
  contactLine,
  createDocDocument,
  photoParagraph,
  sectionHeading,
  titleDateRow,
} from '../shared/docx-common.js';

export async function renderCompactSidebarDocx(
  data: ResumeData,
  photoBuffer?: Buffer | null,
): Promise<Document> {
  const children = [];

  const photo = photoParagraph(photoBuffer, { width: 100, height: 100 });
  if (photo) children.push(photo);

  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.basics.name,
          bold: true,
          size: 32,
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
            size: 20,
            font: 'Calibri',
            color: '475569',
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: contactLine(data),
          size: 16,
          font: 'Calibri',
          color: MUTED,
        }),
      ],
    }),
  );

  const eu = data.euMetadata;
  if (eu) {
    const parts: string[] = [];
    if (eu.workAuthorization) parts.push(eu.workAuthorization);
    if (eu.relocation) parts.push(eu.relocation);
    else if (eu.relocationReady) parts.push('Relocation-ready');
    if (eu.noticePeriod) parts.push(`Notice: ${eu.noticePeriod}`);
    if (eu.preferredLocations?.length) parts.push(joinList(eu.preferredLocations));
    if (parts.length) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          shading: { type: ShadingType.CLEAR, fill: '1E3A5F' },
          children: [
            new TextRun({
              text: parts.join('  ·  '),
              size: 16,
              font: 'Calibri',
              color: 'F8FAFC',
              bold: true,
            }),
          ],
        }),
      );
    }
  }

  if (data.basics.summary) {
    children.push(sectionHeading('Summary', NAVY));
    children.push(bodyParagraph(data.basics.summary));
  }

  if (data.skills.length) {
    children.push(sectionHeading('Skills', NAVY));
    for (const s of data.skills) {
      children.push(bodyParagraph(`${s.name}: ${joinList(s.keywords)}`));
    }
  }

  if (data.languages.length) {
    children.push(sectionHeading('Languages', NAVY));
    children.push(
      bodyParagraph(
        data.languages.map((l) => `${l.language} (${l.fluency})`).join('  ·  '),
      ),
    );
  }

  if (data.work.length) {
    children.push(sectionHeading('Experience', NAVY));
    for (const job of data.work) {
      children.push(
        titleDateRow(
          job.position,
          formatDateRange(job.startDate, job.endDate),
          [job.name, job.location].filter(Boolean).join(' · '),
        ),
      );
      if (job.summary) children.push(bodyParagraph(job.summary, { italics: true, color: MUTED }));
      for (const h of job.highlights) children.push(bullet(h));
    }
  }

  if (data.education.length) {
    children.push(sectionHeading('Education', NAVY));
    for (const ed of data.education) {
      const title = [ed.studyType, ed.area].filter(Boolean).join(', ');
      children.push(
        titleDateRow(
          title,
          formatDateRange(ed.startDate, ed.endDate),
          [ed.institution, ed.location, ed.score].filter(Boolean).join(' · '),
        ),
      );
    }
    if (eu?.degreeRecognition) {
      children.push(bodyParagraph(eu.degreeRecognition, { color: MUTED }));
    }
  } else if (eu?.degreeRecognition) {
    children.push(sectionHeading('Education', NAVY));
    children.push(bodyParagraph(eu.degreeRecognition, { color: MUTED }));
  }

  if (data.certifications.length) {
    children.push(sectionHeading('Certifications', NAVY));
    for (const cert of data.certifications) {
      children.push(
        bodyParagraph([cert.name, cert.issuer, cert.date].filter(Boolean).join(' · ')),
      );
    }
  }

  if (data.projects.length) {
    children.push(sectionHeading('Projects', NAVY));
    for (const p of data.projects) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: p.name,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: CHARCOAL,
            }),
          ],
        }),
      );
      if (p.description) children.push(bodyParagraph(p.description));
      if (p.keywords.length) {
        children.push(bodyParagraph(joinList(p.keywords), { color: MUTED }));
      }
      for (const h of p.highlights) children.push(bullet(h));
    }
  }

  return createDocDocument(children);
}
