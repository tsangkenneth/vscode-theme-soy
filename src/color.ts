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
