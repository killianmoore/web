export type LayoutKind = "landscape" | "portrait";

export function layoutKindForIndex(i: number): LayoutKind {
  // Pattern: 3 landscape, 3 portrait, repeat.
  const mod = i % 6;
  return mod < 3 ? "landscape" : "portrait";
}

export function aspectClass(kind: LayoutKind): string {
  return kind === "landscape" ? "aspect-[3/2]" : "aspect-[2/3]";
}
