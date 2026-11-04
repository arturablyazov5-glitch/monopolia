// Every selectable header city must define each case explicitly.
export const cityForms: Record<string, Record<string, string>> = {
  Белогорск: {
    name: "Белогорск",
    in: "Белогорске",
    from: "Белогорска",
    to: "Белогорск",
  },
  Благовещенск: {
    name: "Благовещенск",
    in: "Благовещенске",
    from: "Благовещенска",
    to: "Благовещенск",
  },
};
export function updateCityTexts(city: string) {
  const forms = cityForms[city] || cityForms.Белогорск;
  document.querySelectorAll<HTMLElement>("[data-city-case]").forEach((el) => {
    el.textContent = forms[el.dataset.cityCase || "name"] || forms.name;
  });
}
