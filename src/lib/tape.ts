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
/** Crisp shared tape visual; geometry and per-instance color stay unchanged. */
export function cleanTapeSource(src: string): string {
  const cleanTape: Record<string, string> = {
    "/assets/tape-beige-export.webp": "/assets/tape-beige-clean.svg",
    "/assets/tape-white-export.webp": "/assets/tape-white-clean.svg",
  };
  return cleanTape[src] ?? src;
}
export function tapesFor(node: string): TapePlacement[] {
  return (placements as Record<string, TapePlacement[]>)[node] ?? [];
}
