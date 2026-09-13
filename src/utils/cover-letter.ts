import type { ResumeData } from '../schema/resume.schema.js';
import type { CoverLetterView } from '../templates/cover-letter/types.js';

/** Approximate years of experience from earliest work startDate. */
export function estimateYearsExperience(work: ResumeData['work']): number | null {
  const years = work
    .map((j) => {
      const m = /^(\d{4})/.exec(j.startDate.trim());
      return m ? Number(m[1]) : null;
    })
    .filter((y): y is number => y !== null);

  if (!years.length) return null;
  const earliest = Math.min(...years);
  const span = new Date().getFullYear() - earliest;
  return span > 0 ? span : null;
}

function educationHighlight(education: ResumeData['education']): string | null {
  const ed = education[0];
  if (!ed) return null;

  const degree = [ed.studyType, ed.area ? `in ${ed.area}` : null].filter(Boolean).join(' ');
  const bits: string[] = [];
  if (degree) bits.push(degree);
  if (ed.score) bits.push(`GPA ${ed.score}`);
  if (ed.institution) bits.push(`from ${ed.institution}`);
  return bits.length ? bits.join(', ') : null;
}

export function buildOpeningParagraph(
  data: ResumeData,
  company: string,
  role: string,
): string {
  const years = estimateYearsExperience(data.work);
  const edu = educationHighlight(data.education);
  const eu = data.euMetadata;

  const experienceBit = years
    ? `with ${years}+ years of engineering experience`
    : 'as an experienced engineer';

  const eduBit = edu ? `, holding a ${edu}` : '';

  const readinessParts: string[] = [];
  if (eu?.workAuthorization) readinessParts.push(eu.workAuthorization);
  if (eu?.noticePeriod) readinessParts.push(`${eu.noticePeriod} notice`);
  if (eu?.relocation) readinessParts.push(eu.relocation);
  else if (eu?.relocationReady) readinessParts.push('relocation-ready');
  const readinessBit = readinessParts.length
    ? `, and ${readinessParts.join(', ')}`
    : '';

  return (
    `I am writing to express my interest in the ${role} position at ${company}. ` +
    `I bring a strong background ${experienceBit}${eduBit}${readinessBit}. ` +
    `I am eager to contribute to your team and help address the challenges outlined in this role.`
  );
}

export function buildClosingParagraph(data: ResumeData): string {
  const links: string[] = [];
  for (const p of data.basics.profiles ?? []) {
    links.push(`${p.network} (${p.url})`);
  }
  if (data.basics.url) {
    const already = links.some((l) => l.includes(data.basics.url!));
    if (!already) links.push(data.basics.url);
  }

  const linkSentence = links.length
    ? ` More of my work is available on ${links.join(' and ')}.`
    : '';

  return (
    `Thank you for considering my application. I would welcome the opportunity to discuss how my background aligns with your needs and to schedule an interview.${linkSentence}`
  );
}

export function buildCoverLetterView(
  data: ResumeData,
  opts: { company: string; role: string; bullets: [string, string] },
): CoverLetterView {
  return {
    basics: data.basics,
    company: opts.company,
    role: opts.role,
    opening: buildOpeningParagraph(data, opts.company, opts.role),
    bullets: opts.bullets,
    closing: buildClosingParagraph(data),
  };
}
