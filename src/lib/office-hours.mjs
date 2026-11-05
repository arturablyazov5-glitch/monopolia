export const officeTimeZone = "Asia/Yakutsk";
export const officeHourTextIds = ["site-footer.text.8", "site-footer.text.9"];
const shortDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const schemaDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseDays(value) {
  const groups = value
    .toLocaleLowerCase("ru-RU")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, "")
    .split(",");
  const days = new Set();
  for (const group of groups) {
    const range = group.split("-");
    const first = shortDays.indexOf(range[0]);
    const last = shortDays.indexOf(range.at(-1));
    if (range.length > 2 || first < 0 || last < first)
      throw new Error("Некорректные дни работы");
    for (let day = first; day <= last; day++) days.add((day + 1) % 7);
  }
  return [...days];
}

/** Читаем те же редактируемые строки, которые показаны в меню и футере. */
export function parseOfficeHoursLine(value) {
  const closed = value.match(/^(.+?)\s*(?:[:\-–—]\s*)?выходн(?:ой|ые)\s*$/iu);
  if (closed) return { days: parseDays(closed[1]), opens: null, closes: null };
  const match = value.match(
    /^(.+?)\s*(?:с\s*)?(\d{1,2}):(\d{2})\s*(?:до|[-\u2010-\u2015])\s*(\d{1,2}):(\d{2})\s*$/iu,
  );
  if (!match)
    throw new Error(
      "Укажите дни и часы, например: Пн-Пт с 09:00 до 18:00 или Сб — выходной",
    );
  const [, days, hour, minute, endHour, endMinute] = match;
  const start = Number(hour) * 60 + Number(minute);
  const end = Number(endHour) * 60 + Number(endMinute);
  if (
    Number(hour) > 23 ||
    Number(endHour) > 23 ||
    Number(minute) > 59 ||
    Number(endMinute) > 59 ||
    end <= start
  ) {
    throw new Error(
      "Время окончания должно быть позже начала, в пределах одних суток",
    );
  }
  const time = (h, m) => `${h.padStart(2, "0")}:${m}`;
  return {
    days: parseDays(days),
    opens: time(hour, minute),
    closes: time(endHour, endMinute),
  };
}

export function officeHours(lines) {
  return lines.map(parseOfficeHoursLine);
}

export function openingHoursSchema(periods) {
  return periods
    .filter((period) => period.opens !== null)
    .map((period) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek:
        period.days.length === 1
          ? schemaDays[period.days[0]]
          : period.days.map((day) => schemaDays[day]),
      opens: period.opens,
      closes: period.closes,
    }));
}

export function isOfficeOpen(date, periods) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: officeTimeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (key) => parts.find((item) => item.type === key)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    part("weekday"),
  );
  const minutes = Number(part("hour")) * 60 + Number(part("minute"));
  const toMinutes = (time) =>
    Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  if (
    periods.some((period) => period.days.includes(day) && period.opens === null)
  )
    return false;
  return periods.some(
    (period) =>
      period.days.includes(day) &&
      period.opens !== null &&
      minutes >= toMinutes(period.opens) &&
      minutes < toMinutes(period.closes),
  );
}
