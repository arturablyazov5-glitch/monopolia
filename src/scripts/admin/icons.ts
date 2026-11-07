/** One hand-drawn, linear icon set shared by Astro and dynamic catalog rows. */
export const iconPaths = {
  logout: "M9 4H4v16h5M11 12h10m-4-4 4 4-4 4",
  building: "M4 21V7l8-4 8 4v14M2 21h20M8 8v2m8-2v2m-8 3v2m8-2v2m-6 6v-4h4v4",
  text: "M4 5h16M12 5v15M8 20h8M4 10V5m16 5V5",
  external:
    "M14 3h7v7m0-7L10 14M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6",
  chevron: "m6 9 6 6 6-6",
  cursor: "m5 3 15 10-7 1-3 7Z",
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
  undo: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
} as const;
export type IconName = keyof typeof iconPaths;
export const iconAttributes = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.5",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;
export function icon(name: IconName) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, value] of Object.entries(iconAttributes))
    svg.setAttribute(key, value);
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", iconPaths[name]);
  svg.append(path);
  return svg;
}
