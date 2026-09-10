import type { CVTemplate } from './types.js';
import { techModernTemplate } from './tech-modern/index.js';
import { classicEuTemplate } from './classic-eu/index.js';
import { compactSidebarTemplate } from './compact-sidebar/index.js';

export type { CVTemplate } from './types.js';

export const TemplateRegistry: Record<string, CVTemplate> = {
  [techModernTemplate.id]: techModernTemplate,
  [classicEuTemplate.id]: classicEuTemplate,
  [compactSidebarTemplate.id]: compactSidebarTemplate,
};

export function getTemplate(id: string): CVTemplate {
  const template = TemplateRegistry[id];
  if (!template) {
    const available = Object.keys(TemplateRegistry).join(', ');
    throw new Error(`Unknown template "${id}". Available: ${available}`);
  }
  return template;
}

export function listTemplates(): CVTemplate[] {
  return Object.values(TemplateRegistry);
}
