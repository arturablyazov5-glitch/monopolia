import { yakutskDate } from "./calendar.mjs";
const months = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];
const monthAtEnd =
  /\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s*$/i;

export function referralPeriod(date = new Date()) {
  // Asia/Yakutsk is UTC+9; use its calendar date, independent of the visitor's zone.
  const local = yakutskDate(date);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const today = Date.UTC(year, month, local.getUTCDate());
  const nextMonth = Date.UTC(year, month + 1, 1);
  const isLastDay = nextMonth - today === 86400000;
  const endExclusive = isLastDay ? Date.UTC(year, month + 2, 1) : nextMonth;
  const days = (endExclusive - (isLastDay ? nextMonth : today)) / 86400000;
  const lastTwo = days % 100;
  const word =
    lastTwo >= 11 && lastTwo <= 14
      ? "дней"
      : days % 10 === 1
        ? "день"
        : days % 10 >= 2 && days % 10 <= 4
          ? "дня"
          : "дней";
  return { month: months[(month + (isLastDay ? 1 : 0)) % 12], days, word };
}

export function referralHeadingPrefix(text) {
  return text.replace(monthAtEnd, "").trimEnd();
}

export function updateReferralBonuses() {
  const period = referralPeriod();
  for (const block of document.querySelectorAll("[data-referral-bonus]")) {
    const prefix = block.querySelector("[data-referral-prefix]");
    if (prefix) {
      const value = prefix.textContent || "";
      const clean = referralHeadingPrefix(value);
      if (value !== clean) prefix.textContent = clean;
    }
    const month = block.querySelector("[data-referral-month]");
    const count = block.querySelector("[data-referral-days]");
    const word = block.querySelector("[data-referral-word]");
    if (month && month.textContent !== period.month)
      month.textContent = period.month;
    if (count && count.textContent !== String(period.days))
      count.textContent = String(period.days);
    if (word && word.textContent !== period.word)
      word.textContent = period.word;
  }
}
