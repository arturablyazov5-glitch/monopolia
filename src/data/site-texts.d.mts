export interface SiteText { id: string; page: string; block: string; label: string; defaultValue: string; maxLength: number; multiline: boolean; lines?: number; }
export const siteTexts: SiteText[];
export function siteText(id: string): string;
