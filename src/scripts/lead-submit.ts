import { leadSource, leadSection } from "../lib/lead-source";
// Загружается динамически при первом фокусе/отправке формы. Секретов здесь нет.
export async function sendLead(form: HTMLFormElement): Promise<void> {
  const endpoint = form.dataset.endpoint;
  if (!endpoint) throw new Error("Отправка пока не настроена. Позвоните нам.");
  const data = Object.fromEntries(new FormData(form));
  const payload = {
    ...data,
    ...JSON.parse(form.dataset.context || "{}"),
    form: form.dataset.form || "lead",
    source: leadSource(form),
    section: form.dataset.leadSection || leadSection(form),
    contactMethod:
      form
        .querySelector(".channels[data-choice-group] [aria-pressed=true]")
        ?.getAttribute("data-value") || "",
    name: data.name || "",
    comment: data.question || data.comment || "",
    consent:
      form.querySelector<HTMLInputElement>("[name=consent]")?.checked === true,
    page: location.origin + location.pathname,
    honeypot: data.honeypot || "",
  };
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
  } catch {
    throw new Error(
      "Нет связи с сервером. Попробуйте ещё раз или позвоните нам.",
    );
  }
  let result: { ok?: boolean; error?: string };
  try {
    result = await response.json();
  } catch {
    throw new Error("Не удалось отправить заявку. Попробуйте ещё раз.");
  }
  if (!response.ok || result.ok !== true) {
    throw new Error(
      response.status === 429
        ? "Слишком много попыток. Повторите через 10 минут."
        : response.status === 400
          ? "Проверьте имя, телефон и согласие. Затем повторите отправку."
          : "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
    );
  }
}
