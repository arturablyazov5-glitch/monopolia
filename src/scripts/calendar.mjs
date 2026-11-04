// The site's calendar follows the office timezone, independent of visitor timezone.
export function yakutskDate(date = new Date()) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}
const months = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];
export function currentMonth(date = new Date()) {
  return months[yakutskDate(date).getUTCMonth()];
}
