import { siteText } from "./site-texts.mjs";
import { officeHourTextIds, officeHours } from "../lib/office-hours.mjs";

/** Стабильные поля CMS остаются единственным источником расписания. */
export function officeHourLines() {
  return officeHourTextIds.map(siteText);
}

export function officeSchedule() {
  return officeHours(officeHourLines());
}
