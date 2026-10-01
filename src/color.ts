import type { Hex } from "./types.ts";

// https://stackoverflow.com/a/39495173
type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;
type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export const withAlpha = (color: Hex, alpha: IntRange<0, 256>): string => {
  return `${color}${alpha.toString(16).padStart(2, "0")}`;
};

// https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
const luminance = (color: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(color.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG contrast ratio of two opaque #rrggbb colors, from 1 to 21
export const contrastRatio = (a: Hex, b: Hex): number => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};
