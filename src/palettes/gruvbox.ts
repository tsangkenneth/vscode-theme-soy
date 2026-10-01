// Colors from https://github.com/morhetz/gruvbox, as used by
// https://github.com/jdinhify/vscode-theme-gruvbox
import type {
  ColorScheme,
  Hex,
  Palette,
  SyntaxRoles,
  Variant,
} from "../types.ts";

type Contrast = "medium" | "hard" | "soft";

const bg0: Record<ColorScheme, Record<Contrast, Hex>> = {
  dark: { hard: "#1d2021", medium: "#282828", soft: "#32302f" },
  light: { hard: "#f9f5d7", medium: "#fbf1c7", soft: "#f2e5bc" },
};

const palettes: Record<ColorScheme, Omit<Palette, "bg0">> = {
  dark: {
    bg1: "#3c3836",
    bg2: "#504945",
    bg3: "#665c54",
    bg4: "#7c6f64",
    grey: "#928374",
    fg0: "#fbf1c7",
    fg1: "#ebdbb2",
    fg2: "#d5c4a1",
    fg3: "#bdae93",
    fg4: "#a89984",
    red1: "#cc241d",
    red2: "#fb4934",
    green1: "#98971a",
    green2: "#b8bb26",
    yellow1: "#d79921",
    yellow2: "#fabd2f",
    blue1: "#458588",
    blue2: "#83a598",
    purple1: "#b16286",
    purple2: "#d3869b",
    aqua1: "#689d6a",
    aqua2: "#8ec07c",
    orange1: "#d65d0e",
    orange2: "#fe8019",
    transparent: "#0000",
    white: "#ebdbb2",
  },
  light: {
    bg1: "#ebdbb2",
    bg2: "#d5c4a1",
    bg3: "#bdae93",
    bg4: "#a89984",
    grey: "#928374",
    fg0: "#282828",
    fg1: "#3c3836",
    fg2: "#504945",
    fg3: "#665c54",
    fg4: "#7c6f64",
    red1: "#cc241d",
    red2: "#9d0006",
    green1: "#98971a",
    green2: "#79740e",
    yellow1: "#d79921",
    yellow2: "#b57614",
    blue1: "#458588",
    blue2: "#076678",
    purple1: "#b16286",
    purple2: "#8f3f71",
    aqua1: "#689d6a",
    aqua2: "#427b58",
    orange1: "#d65d0e",
    orange2: "#af3a03",
    transparent: "#0000",
    white: "#ebdbb2",
  },
};

const syntax = (
  { fg1, fg4, yellow2, orange2, green2, purple2, blue2, red2 }: Omit<
    Palette,
    "bg0"
  >,
  scheme: ColorScheme,
): SyntaxRoles => ({
  text: fg1,
  // Gruvbox's light yellow is too low-contrast for text
  comment: scheme === "dark" ? yellow2 : orange2,
  string: green2,
  constant: purple2,
  definition: blue2,
  punctuation: fg4,
  invalid: red2,
  inserted: green2,
  deleted: red2,
  changed: blue2,
});

const capitalize = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

const schemes: ColorScheme[] = ["dark", "light"];
const contrasts: Contrast[] = ["medium", "hard", "soft"];

export const gruvboxVariants: Variant[] = schemes.flatMap((scheme) =>
  contrasts.map((contrast) => ({
    id: `soy-gruvbox-${scheme}-${contrast}`,
    label: `Soy Gruvbox ${capitalize(scheme)} - ${
      capitalize(contrast)
    } Contrast`,
    type: scheme,
    palette: { ...palettes[scheme], bg0: bg0[scheme][contrast] },
    syntax: syntax(palettes[scheme], scheme),
  }))
);
