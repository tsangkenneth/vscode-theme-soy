// Colors from https://ethanschoonover.com/solarized/
//
// Every slot uses one of the 16 Solarized colors. Solarized is deliberately
// low-contrast, so where the canonical color is too faint for its slot, the
// closest Solarized color with enough contrast is used instead.
import type { ColorScheme, Palette, SyntaxRoles, Variant } from "../types.ts";

const solarized = {
  base03: "#002b36",
  base02: "#073642",
  base01: "#586e75",
  base00: "#657b83",
  base0: "#839496",
  base1: "#93a1a1",
  base2: "#eee8d5",
  base3: "#fdf6e3",
  yellow: "#b58900",
  orange: "#cb4b16",
  red: "#dc322f",
  magenta: "#d33682",
  violet: "#6c71c4",
  blue: "#268bd2",
  cyan: "#2aa198",
  green: "#859900",
} as const;

const {
  base03,
  base02,
  base01,
  base00,
  base0,
  base1,
  base2,
  base3,
  yellow,
  orange,
  red,
  magenta,
  violet,
  blue,
  cyan,
  green,
} = solarized;

// Accents are the same in both schemes. Solarized has one shade per accent,
// except that violet serves as the second shade of magenta.
const accents = {
  red1: red,
  red2: red,
  green1: green,
  green2: green,
  yellow1: yellow,
  yellow2: yellow,
  blue1: blue,
  blue2: blue,
  purple1: magenta,
  purple2: violet,
  aqua1: cyan,
  aqua2: cyan,
  orange1: orange,
  orange2: orange,
  transparent: "#0000",
  // Badge text; reads better than base03 on both magenta and blue
  white: base3,
} as const;

const palettes: Record<ColorScheme, Palette> = {
  dark: {
    bg0: base03,
    bg1: base02,
    bg2: base01,
    bg3: base01,
    bg4: base00,
    grey: base00,
    fg0: base1,
    fg1: base0,
    fg2: base0,
    fg3: base00,
    fg4: base00,
    ...accents,
  },
  light: {
    bg0: base3,
    bg1: base2,
    bg2: base1,
    bg3: base1,
    bg4: base00,
    grey: base00,
    fg0: base02,
    // Canonical body text is base00, but it is only 4.1:1 on base3
    fg1: base01,
    fg2: base01,
    fg3: base00,
    fg4: base00,
    ...accents,
  },
};

const syntax: Record<ColorScheme, SyntaxRoles> = {
  dark: {
    text: palettes.dark.fg1,
    comment: yellow,
    string: green,
    constant: violet,
    definition: blue,
    punctuation: base00,
    invalid: red,
    inserted: green,
    deleted: red,
    changed: blue,
  },
  light: {
    text: palettes.light.fg1,
    // Yellow is too faint on base3
    comment: orange,
    string: green,
    constant: violet,
    definition: blue,
    punctuation: base00,
    invalid: red,
    inserted: green,
    deleted: red,
    changed: blue,
  },
};

// The official Solarized terminal palette, the same in both schemes
const terminal = {
  "terminal.ansiBlack": base02,
  "terminal.ansiRed": red,
  "terminal.ansiGreen": green,
  "terminal.ansiYellow": yellow,
  "terminal.ansiBlue": blue,
  "terminal.ansiMagenta": magenta,
  "terminal.ansiCyan": cyan,
  "terminal.ansiWhite": base2,
  "terminal.ansiBrightBlack": base03,
  "terminal.ansiBrightRed": orange,
  "terminal.ansiBrightGreen": base01,
  "terminal.ansiBrightYellow": base00,
  "terminal.ansiBrightBlue": base0,
  "terminal.ansiBrightMagenta": violet,
  "terminal.ansiBrightCyan": base1,
  "terminal.ansiBrightWhite": base3,
};

export const solarizedVariants: Variant[] = (["light", "dark"] as const).map((
  scheme,
) => ({
  id: `soy-solarized-${scheme}`,
  label: `Soy Solarized ${scheme === "dark" ? "Dark" : "Light"}`,
  type: scheme,
  palette: palettes[scheme],
  syntax: syntax[scheme],
  uiOverrides: terminal,
}));
