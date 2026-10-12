import placements from "./tape-placements.json";

/** Геометрия отдельной ленты, измеренная в локальной системе листа Figma. */
export interface TapePlacement {
  node?: string;
  src: string;
  width: number;
  height: number;
  horizontal: string;
  vertical: string;
  x: number;
  y: number;
  matrix: number[];
  shadow: string;
  opacity: number;
}
export function tapesFor(node: string): TapePlacement[] {
  return (placements as Record<string, TapePlacement[]>)[node] ?? [];
}
