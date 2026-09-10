import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IBorderOptions,
  type FileChild,
} from 'docx';
import type { ResumeData } from '../../schema/resume.schema.js';
import { formatDateRange, joinList } from '../../utils/formatters.js';

export const CHARCOAL = '1E293B';
export const MUTED = '64748B';
export const BORDER = 'E2E8F0';
export const NAVY = '1E3A5F';

const noBorder: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

export function sectionHeading(text: string, accent = NAVY): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 12, color: BORDER, space: 4 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 20,
        font: 'Calibri',
        color: accent,
      }),
    ],
  });
}

export function bodyParagraph(text: string, opts?: { italics?: boolean; color?: string }): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        size: 20,
        font: 'Calibri',
        color: opts?.color ?? CHARCOAL,
        italics: opts?.italics,
      }),
    ],
  });
}

export function bullet(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: `• ${text}`, size: 20, font: 'Calibri', color: CHARCOAL }),
    ],
  });
}

/** Title (75%) / date (25%) row — avoids alignment collisions in Word. */
export function titleDateRow(title: string, dateRange: string, subtitle?: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 75, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { after: subtitle ? 20 : 40 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 22,
                    font: 'Calibri',
                    color: CHARCOAL,
                  }),
                ],
              }),
              ...(subtitle
                ? [
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [
                        new TextRun({
                          text: subtitle,
                          size: 20,
                          font: 'Calibri',
                          color: MUTED,
                          italics: true,
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: dateRange,
                    size: 18,
                    font: 'Calibri',
                    color: MUTED,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export function buildEuBanner(data: ResumeData): Paragraph[] {
  const eu = data.euMetadata;
  if (!eu) return [];

  const parts: string[] = [];
  if (eu.workAuthorization) parts.push(eu.workAuthorization);
  if (eu.relocation) parts.push(eu.relocation);
  else if (eu.relocationReady) parts.push('Relocation-ready');
  if (eu.noticePeriod) parts.push(`Notice: ${eu.noticePeriod}`);
  if (eu.preferredLocations?.length) {
    parts.push(`Targets: ${joinList(eu.preferredLocations)}`);
  }

  if (!parts.length) return [];

  return [
    new Paragraph({
      spacing: { before: 120, after: 120 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER, space: 6 },
      },
      children: [
        new TextRun({
          text: parts.join('  ·  '),
          size: 18,
          font: 'Calibri',
          color: NAVY,
          bold: true,
        }),
      ],
    }),
  ];
}

export function photoParagraph(
  photoBuffer: Buffer | null | undefined,
  opts: { width: number; height: number },
): Paragraph | null {
  if (!photoBuffer?.length) return null;
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new ImageRun({
        data: photoBuffer,
        transformation: { width: opts.width, height: opts.height },
        type: 'jpg',
      }),
    ],
  });
}

export function contactLine(data: ResumeData): string {
  const b = data.basics;
  const bits: string[] = [];
  if (b.email) bits.push(b.email);
  if (b.phone) bits.push(b.phone);
  if (b.url) bits.push(b.url);
  if (b.location?.city) {
    const loc = [b.location.city, b.location.countryCode].filter(Boolean).join(', ');
    bits.push(loc);
  }
  for (const p of b.profiles ?? []) {
    bits.push(p.url);
  }
  return bits.join('  ·  ');
}

export function standardSections(data: ResumeData, accent = NAVY): FileChild[] {
  const children: FileChild[] = [];

  if (data.basics.summary) {
    children.push(sectionHeading('Summary', accent));
    children.push(bodyParagraph(data.basics.summary));
  }

  if (data.work.length) {
    children.push(sectionHeading('Experience', accent));
    for (const job of data.work) {
      children.push(
        titleDateRow(
          `${job.position} — ${job.name}`,
          formatDateRange(job.startDate, job.endDate),
          job.location,
        ),
      );
      if (job.summary) children.push(bodyParagraph(job.summary, { italics: true, color: MUTED }));
      for (const h of job.highlights) children.push(bullet(h));
    }
  }

  if (data.skills.length) {
    children.push(sectionHeading('Skills', accent));
    for (const s of data.skills) {
      children.push(bodyParagraph(`${s.name}: ${joinList(s.keywords)}`));
    }
  }

  if (data.education.length) {
    children.push(sectionHeading('Education', accent));
    for (const ed of data.education) {
      const title = [ed.studyType, ed.area].filter(Boolean).join(', ');
      children.push(
        titleDateRow(
          `${title} — ${ed.institution}`,
          formatDateRange(ed.startDate, ed.endDate),
          ed.score ? `GPA: ${ed.score}` : undefined,
        ),
      );
    }
  }

  if (data.certifications.length) {
    children.push(sectionHeading('Certifications', accent));
    for (const cert of data.certifications) {
      const line = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' · ');
      children.push(bodyParagraph(line));
    }
  }

  if (data.languages.length) {
    children.push(sectionHeading('Languages', accent));
    children.push(
      bodyParagraph(
        data.languages.map((l) => `${l.language} (${l.fluency})`).join('  ·  '),
      ),
    );
  }

  if (data.projects.length) {
    children.push(sectionHeading('Projects', accent));
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
            ...(p.url
              ? [
                  new TextRun({
                    text: `  ${p.url}`,
                    size: 18,
                    font: 'Calibri',
                    color: MUTED,
                  }),
                ]
              : []),
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

  if (data.euMetadata?.degreeRecognition) {
    children.push(sectionHeading('Credentials', accent));
    children.push(bodyParagraph(data.euMetadata.degreeRecognition));
  }

  return children;
}

export function createDocDocument(children: FileChild[]): Document {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });
}
