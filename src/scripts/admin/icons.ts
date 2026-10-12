/** One hand-drawn, linear icon set shared by Astro and dynamic catalog rows. */
export const iconPaths = {
  edit: "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  eyeOff:
    "m3 3 18 18M10 5h2c6.5 0 10 7 10 7a19 19 0 0 1-3 4M6 6a20 20 0 0 0-4 6s3.5 7 10 7c2 0 3.5-.5 5-1.5M9.8 9.8a3 3 0 0 0 4.4 4.4",
  up: "m6 10 6-6 6 6M12 4v16",
  down: "m6 14 6 6 6-6M12 4v16",
  plus: "M12 4v16M4 12h16",
  reload: "M20 10a8 8 0 1 0-1 7M20 4v6h-6",
  close: "m6 6 12 12M18 6 6 18",
  camera: "M4 6h4l2-3h4l2 3h4v15H4ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6",
  login: "M9 4h11v16H9M3 12h11m-4-4 4 4-4 4",
} as const;
export type IconName = keyof typeof iconPaths;
export function icon(name: IconName) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, value] of Object.entries({
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.8",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  }))
    svg.setAttribute(key, value);
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", iconPaths[name]);
  svg.append(path);
  return svg;
}
