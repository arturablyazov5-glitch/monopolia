/**
 * Маска российского телефона: +7 (999) 999-99-99.
 * Пропускает только цифры (буквы и символы отбрасываются, в том числе при вставке),
 * лишние цифры после десятой обрезаются.
 */
const format = (digits: string) =>
  "+7 (" +
  digits.slice(0, 3) +
  (digits.length >= 3 ? ") " : "") +
  digits.slice(3, 6) +
  (digits.length > 6 ? "-" + digits.slice(6, 8) : "") +
  (digits.length > 8 ? "-" + digits.slice(8, 10) : "");

const nationalDigits = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("7") || digits.startsWith("8")
    ? digits.slice(1)
    : digits;
};

export function applyPhoneMask(input: HTMLInputElement, onChange?: () => void) {
  let previous = "";
  input.addEventListener("input", (event) => {
    const deleting = (event as InputEvent).inputType?.startsWith("delete");
    let digits = nationalDigits(input.value).slice(0, 10);
    // Стёрли только символ маски («)», пробел, «-») — убираем цифру перед ним,
    // иначе маска тут же вернёт символ и стереть его не получится.
    if (deleting && digits === previous && digits.length)
      digits = digits.slice(0, -1);
    input.value = digits.length ? format(digits) : "";
    previous = nationalDigits(input.value);
    onChange?.();
  });
  // Фокус на пустом поле сразу показывает префикс +7
  input.addEventListener("focus", () => {
    if (!input.value) {
      input.value = "+7 (";
      previous = "";
    }
  });
  input.addEventListener("blur", () => {
    if (input.value === "+7 (") input.value = "";
  });
}
