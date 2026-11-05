export interface OfficePeriod {
  days: number[];
  opens: string | null;
  closes: string | null;
}
export interface OpeningHours {
  "@type": string;
  dayOfWeek: string | string[];
  opens: string | null;
  closes: string | null;
}
export const officeTimeZone: string;
export const officeHourTextIds: string[];
export function parseOfficeHoursLine(value: string): OfficePeriod;
export function officeHours(lines: string[]): OfficePeriod[];
export function openingHoursSchema(periods: OfficePeriod[]): OpeningHours[];
export function isOfficeOpen(date: Date, periods: OfficePeriod[]): boolean;
