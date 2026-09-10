import Handlebars from 'handlebars';
import { formatDate, formatDateRange, joinList } from '../../utils/formatters.js';

let registered = false;

export function registerHelpers(): void {
  if (registered) return;

  Handlebars.registerHelper('formatDate', (value: string) => formatDate(value));

  Handlebars.registerHelper('formatDateRange', (start: string, end: string) =>
    formatDateRange(start, end),
  );

  Handlebars.registerHelper('joinList', (items: string[], sep?: string) =>
    joinList(items, typeof sep === 'string' ? sep : ', '),
  );

  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

  Handlebars.registerHelper('yesNo', (value: boolean | undefined) =>
    value === true ? 'Yes' : value === false ? 'No' : '',
  );

  registered = true;
}
