const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Format `2022-01` or `2022-01-15` → `Jan 2022`. Empty / missing → empty string. */
export function formatDate(value?: string | null): string {
  if (!value || !value.trim()) return '';
  const match = /^(\d{4})-(\d{2})/.exec(value.trim());
  if (!match) return value.trim();
  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value.trim();
  return `${MONTHS[monthIndex]} ${year}`;
}

const PRESENT_TOKENS = new Set(['present', 'current', 'now', 'ongoing']);

/** Format a date range; empty / Present end date becomes `Present`. */
export function formatDateRange(start?: string | null, end?: string | null): string {
  const startLabel = formatDate(start);
  if (!startLabel) return '';
  const endRaw = end?.trim() ?? '';
  const endLabel =
    !endRaw || PRESENT_TOKENS.has(endRaw.toLowerCase()) ? 'Present' : formatDate(endRaw);
  return `${startLabel} – ${endLabel}`;
}

/** Join list items without trailing delimiters. */
export function joinList(items: string[] | undefined, separator = ', '): string {
  if (!items?.length) return '';
  return items.filter(Boolean).join(separator);
}

/** Sanitize a full name for output filenames: `Jane Doe` → `Jane_Doe`. */
export function filenameSlug(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'CV';
}
