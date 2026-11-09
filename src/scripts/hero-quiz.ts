import { applyPhoneMask } from "../lib/phone-mask";
import { formErrors } from "../lib/form-errors";
import { sellQuizStep } from "../data/sell-quiz";

type Step = {
  question: string;
  options?: string[];
  multiple?: boolean;
  other?: boolean;
};
const budgets: Record<string, string[]> = {
  Гараж: [
    "До 300 тыс. ₽",
    "300‑600 тыс. ₽",
    "600 тыс.–1 млн ₽",
    "Больше 1 млн ₽",
    "Пока не решили",
  ],
  Участок: [
    "До 500 тыс. ₽",
    "500 тыс.–1,5 млн ₽",
    "1,5‑3 млн ₽",
    "Больше 3 млн ₽",
    "Пока не решили",
  ],
  Другое: [
    "До 500 тыс. ₽",
    "500 тыс.–1,5 млн ₽",
    "1,5‑3 млн ₽",
    "3‑8 млн ₽",
    "Больше 8 млн ₽",
    "Пока не решили",
  ],
};
const commonBudget = [
  "До 3 млн ₽",
  "3‑5 млн ₽",
  "5‑8 млн ₽",
  "8‑12 млн ₽",
  "Больше 12 млн ₽",
  "Пока не решили",
];
const needs: Record<string, Step> = {
  Квартира: {
    question: "Что должно быть рядом? (можно выбрать несколько)",
    options: [
      "Школа и садик",
      "Магазины и ТЦ",
      "Парковка",
      "Остановка",
      "Парк или река",
      "Неважно",
    ],
    multiple: true,
  },
  Участок: {
    question: "Что должно быть на участке? (можно выбрать несколько)",
    options: ["Электричество", "Вода", "Газ", "Подъезд по асфальту", "Неважно"],
    multiple: true,
  },
  Гараж: {
    question: "Каким должен быть гараж? (можно выбрать несколько)",
    options: [
      "Отапливаемый",
      "Охраняемый",
      "С подвалом",
      "Со смотровой ямой",
      "С розеткой 380",
      "Рядом с домом",
      "Неважно",
    ],
    multiple: true,
  },
  "Коммерческая недвижимость": {
    question: "Под что ищете помещение?",
    options: [
      "Магазин",
      "Кафе или бар",
      "Офис",
      "Салон",
      "Производство",
      "Склад",
      "Сдавать в аренду",
    ],
  },
  Другое: { question: "Что для вас важно?", other: true },
};
const payments: Record<string, string[]> = {
  Квартира: [
    "Наличные",
    "Ипотека одобрена",
    "Ипотека, еще не подавали",
    "Обмен",
    "Не знаю",
  ],
  Гараж: ["Наличные", "Кредит", "Обмен", "Не знаю"],
  Участок: ["Наличные", "Ипотека", "Кредит", "Обмен", "Не знаю"],
  "Коммерческая недвижимость": [
    "Наличные",
    "Кредит",
    "Лизинг",
    "Обмен",
    "Не знаю",
  ],
};
function initializeHeroQuizzes() {
  document.querySelectorAll<HTMLElement>(".inner-hero-card").forEach((card) => {
    const form = card.querySelector<HTMLFormElement>(".buy-quiz");
    const start = card.querySelector<HTMLButtonElement>("[data-quiz-start]");
    if (!form || !start || form.dataset.quizInitialized) return;
    form.dataset.quizInitialized = "true";
    const selling = form.dataset.quizVariant === "sell";
    const extra = form.querySelector<HTMLElement>("[data-quiz-extra]")!;
    const mainError = form.querySelector<HTMLElement>(
      "[data-quiz-main-error]",
    )!;
    let extraAnswer = "";
    let showAreaErrors = false;
    const intro = [...card.querySelectorAll<HTMLElement>("[data-quiz-intro]")];
    const typeError = card.querySelector<HTMLElement>(
      "[data-hero-type-error]",
    )!;
    const otherType = card.querySelector<HTMLElement>("[data-hero-other]")!;
    const otherTypeInput = card.querySelector<HTMLInputElement>(
      "[data-hero-other-input]",
    )!;
    const fullPlaceholder = otherTypeInput.placeholder;
    const mobile = matchMedia("(max-width: 767px)");
    const updateOtherPlaceholder = () => {
      otherTypeInput.placeholder = mobile.matches
        ? fullPlaceholder.split(",")[0]
        : fullPlaceholder;
    };
    updateOtherPlaceholder();
    mobile.addEventListener("change", updateOtherPlaceholder);
    otherTypeInput.addEventListener("input", () => {
      typeError.hidden = true;
      otherTypeInput.removeAttribute("aria-invalid");
    });
    card
      .querySelector(".inner-hero-types [data-choice-group]")
      ?.addEventListener("choice-change", (event) => {
        otherType.hidden = (event as CustomEvent).detail.value !== "Другое";
        typeError.hidden = true;
      });
    const question = form.querySelector<HTMLElement>("[data-quiz-question]")!;
    const options = form.querySelector<HTMLElement>("[data-quiz-options]")!;
    const other = form.querySelector<HTMLTextAreaElement>("[data-quiz-other]")!;
    const contact = form.querySelector<HTMLElement>("[data-quiz-contact]")!;
    const questions = form.querySelector<HTMLElement>("[data-quiz-questions]")!;
    const answer = form.querySelector<HTMLElement>("[data-quiz-answer]")!;
    const controls = form.querySelector<HTMLElement>("[data-quiz-controls]")!;
    const next = form.querySelector<HTMLButtonElement>("[data-quiz-next]")!;
    const back = form.querySelector<HTMLButtonElement>("[data-quiz-back]")!;
    const stepLabel = form.querySelector<HTMLElement>("[data-quiz-step]")!;
    const result = form.querySelector<HTMLElement>("[data-quiz-result]")!;
    const phone = form.querySelector<HTMLInputElement>("[name=phone]")!;
    applyPhoneMask(phone);
    const consent = form.querySelector<HTMLInputElement>("[name=consent]")!;
    const fieldErrors = Object.fromEntries(
      [...form.querySelectorAll<HTMLElement>("[data-quiz-error]")].map((el) => [
        el.dataset.quizError!,
        el,
      ]),
    );
    consent.setAttribute("aria-describedby", fieldErrors.consent.id);
    form
      .querySelector(".channels")
      ?.setAttribute("aria-describedby", fieldErrors.channel.id);
    function clearError(name: string) {
      fieldErrors[name].hidden = true;
      if (name === "phone") phone.removeAttribute("aria-invalid");
      if (name === "consent") consent.removeAttribute("aria-invalid");
    }
    phone.addEventListener("input", () => clearError("phone"));
    consent.addEventListener("change", () => clearError("consent"));
    form.addEventListener("choice-change", () => clearError("channel"));
    phone.addEventListener("input", () => phone.setCustomValidity(""));
    const success = form.querySelector<HTMLElement>("[data-quiz-success]")!;
    let step = 2,
      type = "",
      city = "";
    const answers: Record<number, string[]> = {};
    // Opening a dialog starts this instance again without touching other cards.
    form.addEventListener("reset", () => {
      for (const key of [2, 3, 4]) delete answers[key];
      extraAnswer = "";
      showAreaErrors = false;
      step = 2;
      type = "";
      city = "";
      delete form.dataset.context;
      form.hidden = true;
      intro.forEach((el) => (el.hidden = false));
      success.hidden = true;
      controls.hidden = false;
      result.hidden = true;
      typeError.hidden = true;
      otherType.hidden = true;
      otherTypeInput.value = "";
      Object.keys(fieldErrors).forEach(clearError);
      phone.setCustomValidity("");
      card
        .querySelectorAll<HTMLElement>(
          "[data-choice-group]:not(.contact-method-options) [aria-pressed]",
        )
        .forEach((button) => {
          button.classList.remove("selected");
          button.setAttribute("aria-pressed", "false");
        });
      card
        .querySelectorAll<HTMLElement>("[data-city-menu]")
        .forEach((menu) => (menu.hidden = true));
      card
        .querySelector("[data-city-toggle]")
        ?.setAttribute("aria-expanded", "false");
    });
    function definition(): Step {
      if (selling) return sellQuizStep(type, step);
      if (step === 2)
        return {
          question: "Какой у вас бюджет?",
          options: budgets[type] || commonBudget,
        };
      if (step === 3)
        return needs[type === "Дом" ? "Квартира" : type] || needs["Другое"];
      return {
        question: "Как планируете покупать?",
        options:
          payments[type === "Дом" ? "Квартира" : type] || payments["Участок"],
      };
    }
    function render() {
      result.classList.remove("is-success");
      Object.values(fieldErrors).forEach((el) => (el.hidden = true));
      (step === 5 ? contact : answer).append(result);
      result.hidden = true;
      questions.hidden = step === 5;
      contact.hidden = step !== 5;
      stepLabel.textContent = `Шаг ${step} из 5`;
      next.textContent =
        step === 5
          ? selling
            ? "Найти покупателя"
            : "Получить подборку"
          : "Далее";
      next.type = "button";
      if (step === 5) return;
      const def = definition();
      question.textContent = def.question;
      const hasAreaQuestions = selling && type === "Дом" && step === 2;
      mainError.hidden =
        !hasAreaQuestions || !showAreaErrors || !!answers[step]?.length;
      options.hidden = !def.options?.length;
      other.hidden = !def.other;
      other.placeholder = selling
        ? "Например: доля 1/2 в двухкомнатной квартире в центре, новый ремонт"
        : "Например: школа рядом, отапливаемое помещение, ворота под фуру";
      extra.hidden = !hasAreaQuestions;
      extra.replaceChildren();
      if (!extra.hidden) {
        const title = document.createElement("p");
        title.className = "buy-quiz-question";
        title.textContent = "Какая площадь участка?";
        const group = document.createElement("div");
        group.className = "buy-quiz-options choice-hover";
        for (const label of [
          "До 6 соток",
          "6‑10 соток",
          "10‑15 соток",
          "Больше 15 соток",
        ]) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "chip";
          button.textContent = label;
          button.classList.toggle("selected", extraAnswer === label);
          button.setAttribute("aria-pressed", String(extraAnswer === label));
          button.addEventListener("click", () => {
            extraAnswer = label;
            render();
          });
          group.append(button);
        }
        const extraError = document.createElement("p");
        extraError.className = "lead-field-error form-error";
        extraError.textContent = formErrors.answer;
        extraError.setAttribute("role", "status");
        extraError.hidden = !showAreaErrors || !!extraAnswer;
        extra.append(title, group, extraError);
      }
      other.value = def.other ? answers[step]?.[0] || "" : "";
      options.replaceChildren();
      for (const label of def.options || []) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chip";
        button.textContent = label;
        const selected = (answers[step] || []).includes(label);
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
        button.addEventListener("click", () => {
          let values = answers[step] || [];
          if (!def.multiple) values = [label];
          else if (label === "Неважно" || label === "Ничего")
            values = values.includes(label) ? [] : [label];
          else
            values = values.includes(label)
              ? values.filter((v) => v !== label)
              : [
                  ...values.filter((v) => v !== "Неважно" && v !== "Ничего"),
                  label,
                ];
          answers[step] = values;
          render();
        });
        options.append(button);
      }
    }
    function scrollToQuiz() {
      requestAnimationFrame(() => {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    start.addEventListener("click", () => {
      city = card.querySelector<HTMLInputElement>("[name=city]")?.value || "";
      type =
        card.querySelector<HTMLElement>(".inner-hero-types [aria-pressed=true]")
          ?.dataset.value || "";
      const missingOtherType =
        type === "Другое" && !otherTypeInput.value.trim();
      otherTypeInput.setAttribute("aria-invalid", String(missingOtherType));
      if (!type || missingOtherType) {
        typeError.hidden = false;
        if (missingOtherType) otherTypeInput.focus();
        return;
      }
      for (const key of [2, 3, 4]) delete answers[key];
      extraAnswer = "";
      showAreaErrors = false;
      step = 2;
      intro.forEach((el) => (el.hidden = true));
      form.hidden = false;
      render();
      scrollToQuiz();
    });
    back.addEventListener("click", () => {
      if (step === 2) {
        form.hidden = true;
        intro.forEach((el) => (el.hidden = false));
        start.focus({ preventScroll: true });
        scrollToQuiz();
        return;
      }
      step--;
      render();
      scrollToQuiz();
    });
    next.addEventListener("click", () => {
      if (step === 5) {
        form.requestSubmit();
        return;
      }
      if (definition().other)
        answers[step] = other.value.trim() ? [other.value.trim()] : [];
      if (selling && type === "Дом" && step === 2) {
        showAreaErrors = true;
        if (!answers[step]?.length || !extraAnswer) {
          render();
          return;
        }
      } else if (!answers[step]?.length) {
        result.textContent = formErrors.answer;
        result.hidden = false;
        return;
      }
      step++;
      render();
      scrollToQuiz();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (step !== 5 || next.disabled) return;
      const channel =
        form.querySelector<HTMLInputElement>("[name=channel]")?.value;
      const validPhone =
        /^\+?[\d()\s-]+$/.test(phone.value) &&
        (phone.value.startsWith("+")
          ? /^7\d{10}$/
          : /^(?:[78]\d{10}|\d{10})$/
        ).test(phone.value.replace(/\D/g, ""));
      phone.setAttribute("aria-invalid", String(!validPhone));
      consent.setAttribute("aria-invalid", String(!consent.checked));
      fieldErrors.phone.hidden = validPhone;
      fieldErrors.channel.hidden = !!channel;
      fieldErrors.consent.hidden = consent.checked;
      result.hidden = true;
      if (!validPhone || !channel || !consent.checked) return;
      city = card.querySelector<HTMLInputElement>("[name=city]")?.value || city;
      const characteristicsLabel =
        type === "Квартира"
          ? "Комнаты"
          : type === "Гараж"
            ? "Тип гаража"
            : type === "Участок"
              ? "Площадь участка"
              : "Площадь";
      const conditionLabel =
        type === "Гараж"
          ? "Оснащение гаража"
          : type === "Участок"
            ? "На участке"
            : type === "Коммерческая недвижимость"
              ? "Использование помещения"
              : type === "Другое"
                ? "Описание объекта"
                : "Состояние";
      form.dataset.context = JSON.stringify({
        city,
        propertyType: type,
        subject: selling ? "Продать объект" : "Подборка объектов",
        channel,
        comment: selling
          ? `${characteristicsLabel}: ${answers[2].join(", ")}${extraAnswer ? "; участок: " + extraAnswer : ""}.\n${conditionLabel}: ${answers[3].join(", ")}.\nСрок продажи: ${answers[4].join(", ")}.`
          : `Бюджет: ${answers[2].join(", ")}.\nПожелания: ${answers[3].join(", ")}.\nСпособ покупки: ${answers[4].join(", ")}.`,
      });
      if (type === "Другое" && otherTypeInput.value.trim()) {
        const context = JSON.parse(form.dataset.context);
        context.comment = `Тип объекта: ${otherTypeInput.value.trim()}.\n${context.comment}`;
        form.dataset.context = JSON.stringify(context);
      }
      next.disabled = true;
      back.disabled = true;
      result.hidden = true;
      form.setAttribute("aria-busy", "true");
      try {
        // Ленивый чанк: lead-submit не нужен до первого submit квиза.
        const { sendLead } = await import("./lead-submit");
        await sendLead(form);
        questions.hidden = true;
        contact.hidden = true;
        controls.hidden = true;
        result.hidden = true;
        success.hidden = false;
      } catch (error) {
        result.textContent =
          error instanceof Error
            ? error.message
            : "Не удалось отправить заявку. Попробуйте еще раз.";
        result.hidden = false;
      } finally {
        next.disabled = false;
        back.disabled = false;
        form.removeAttribute("aria-busy");
      }
    });
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeHeroQuizzes, {
    once: true,
  });
} else {
  initializeHeroQuizzes();
}
