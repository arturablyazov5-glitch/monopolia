/** Format money only outside the active input; keep arbitrary legacy labels intact. */
function parts(value: string) {
  const compact = value
    .trim()
    .replace(/\s/g, "")
    .replace(/(?:₽|руб\.?)(?:\/м[²2])?$/iu, "");
  const match = compact.match(/^(\d+)(?:[,.](\d{1,2}))?$/);
  if (!match) return null;
  return { integer: match[1].replace(/^0+(?=\d)/, ""), fraction: match[2] };
}
export function priceForEditing(value: string) {
  const parsed = parts(value);
  return parsed
    ? parsed.integer + (parsed.fraction ? "," + parsed.fraction : "")
    : value;
}
export function formatPrice(value: string, perMeter = false) {
  const parsed = parts(value);
  if (!parsed) return value;
  const number =
    parsed.integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ") +
    (parsed.fraction ? "," + parsed.fraction : "");
  return number + (perMeter ? " ₽/м²" : " ₽");
}
