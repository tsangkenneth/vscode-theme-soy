import type { Variant } from "./types.ts";
import { gruvboxVariants } from "./palettes/gruvbox.ts";
import { solarizedVariants } from "./palettes/solarized.ts";
import { nordVariants } from "./palettes/nord.ts";

export const variants: Variant[] = [
  ...gruvboxVariants,
  ...solarizedVariants,
  ...nordVariants,
];
