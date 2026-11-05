import {
  isOfficeOpen,
  officeHours,
  openingHoursSchema,
  type OfficePeriod,
} from "../lib/office-hours.mjs";

let periods: OfficePeriod[] = [];
const updateStatus = () => {
  const open = isOfficeOpen(new Date(), periods);
  document
    .querySelectorAll<HTMLElement>("[data-office-status]")
    .forEach((status) => {
      status.textContent = open ? "Сейчас работаем" : "Сейчас закрыто";
      status.closest(".office-status")?.classList.toggle("closed", !open);
    });
};
const refreshSchedule = () => {
  const element = document.querySelector("[data-office-hours]");
  if (!element) return;
  const lines = [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent?.trim() ?? "")
    .filter(Boolean);
  try {
    periods = officeHours(lines);
  } catch {
    return;
  }
  const schema = document.querySelector<HTMLScriptElement>(
    "script[data-business-schema]",
  );
  if (schema) {
    const business = JSON.parse(schema.textContent || "{}");
    business.openingHoursSpecification = openingHoursSchema(periods);
    schema.textContent = JSON.stringify(business).replace(/</g, "\\u003c");
  }
  updateStatus();
};

refreshSchedule();
document.querySelectorAll("[data-office-hours]").forEach((element) => {
  new MutationObserver(refreshSchedule).observe(element, {
    childList: true,
    characterData: true,
    subtree: true,
  });
});
// Обновляем статус и после смены минуты, и после возврата в открытую вкладку.
const nextMinute = () => {
  setTimeout(
    () => {
      updateStatus();
      nextMinute();
    },
    60_000 - (Date.now() % 60_000),
  );
};
nextMinute();
document.addEventListener("visibilitychange", updateStatus);
