import { updateCityTexts } from "../data/city-forms";
/**
 * Выпадающие списки города: шапка и первый экран внутренних страниц.
 * Выбор города общий для шапки и карточек квизов и сохраняется в localStorage.
 */
const KEY = "city";

// The header remains the source for city-dependent page content.
export function getHeaderCity() {
  return (
    document
      .querySelector<HTMLElement>("header [data-city-picker] [data-city-label]")
      ?.textContent?.trim() ?? ""
  );
}

const readSaved = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export function initCityPickers() {
  const pickers = [
    ...document.querySelectorAll<HTMLElement>("[data-city-picker]"),
  ];
  if (!pickers.length) return;

  const apply = (value: string, targets = pickers) => {
    targets.forEach((picker) => {
      const label = picker.querySelector<HTMLElement>("[data-city-label]");
      if (label) label.textContent = value;
      picker
        .querySelectorAll<HTMLElement>("[data-city-option]")
        .forEach((o) =>
          o.setAttribute(
            "aria-selected",
            String(o.dataset.cityOption === value),
          ),
        );
      const field = picker.querySelector<HTMLInputElement>("input[name=city]");
      if (field) field.value = value;
    });
    if (targets.some((picker) => picker.closest("header"))) {
      updateCityTexts(getHeaderCity());
      window.dispatchEvent(
        new CustomEvent("city-changed", { detail: { city: getHeaderCity() } }),
      );
    }
  };

  const known = (value: string | null): value is string =>
    !!value &&
    pickers[0].querySelector(`[data-city-option="${CSS.escape(value)}"]`) !==
      null;

  const saved = readSaved();
  const initial = known(saved) ? saved : getHeaderCity();
  if (known(initial)) apply(initial);
  updateCityTexts(getHeaderCity());

  const choose = (value: string) => {
    apply(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {}
  };

  // Выбор в другой вкладке тоже подхватывается
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && known(e.newValue)) apply(e.newValue);
  });

  pickers.forEach((picker) => {
    const toggle =
      picker.querySelector<HTMLButtonElement>("[data-city-toggle]")!;
    const list = picker.querySelector<HTMLElement>("[data-city-menu]")!;
    const options = [
      ...picker.querySelectorAll<HTMLElement>("[data-city-option]"),
    ];
    const setOpen = (open: boolean) => {
      list.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => {
      const open = list.hidden;
      pickers.forEach((p) => {
        if (p !== picker) {
          p.querySelector<HTMLElement>("[data-city-menu]")!.hidden = true;
          p.querySelector("[data-city-toggle]")!.setAttribute(
            "aria-expanded",
            "false",
          );
        }
      });
      setOpen(open);
    });
    options.forEach((o) =>
      o.addEventListener("click", () => {
        choose(o.dataset.cityOption!);
        setOpen(false);
        toggle.focus({ preventScroll: true });
      }),
    );
    picker.addEventListener("keydown", (e) => {
      const key = e.key;
      const target = e.target as HTMLElement;
      if (key === "Escape" && !list.hidden) {
        setOpen(false);
        toggle.focus();
      } else if (
        (key === "ArrowDown" || key === "ArrowUp") &&
        target === toggle
      ) {
        e.preventDefault();
        setOpen(true);
        options[0].focus();
      } else if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        const i = options.indexOf(target) + (key === "ArrowDown" ? 1 : -1);
        options[(i + options.length) % options.length].focus();
      } else if ((key === "Enter" || key === " ") && options.includes(target)) {
        e.preventDefault();
        target.click();
      }
    });
  });
  // Один слушатель на документ для всех пикеров страницы: раньше каждый
  // [data-city-picker] вешал свой, и каждый клик прогонял contains по всем.
  document.addEventListener("click", (e) => {
    pickers.forEach((picker) => {
      if (!picker.contains(e.target as Node)) {
        const list = picker.querySelector<HTMLElement>("[data-city-menu]");
        if (list && !list.hidden) {
          list.hidden = true;
          picker
            .querySelector("[data-city-toggle]")
            ?.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
}
