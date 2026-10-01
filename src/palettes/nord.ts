// Colors from https://www.nordtheme.com/docs/colors-and-palettes
//
// Every slot uses one of the 16 Nord colors. Nord has no shade between
// nord3 (backgrounds) and nord4 (text), so dimmed text uses nord4 where it
// must stay readable, or nord10 where it should look subdued.
import type { Palette, SyntaxRoles, Variant } from "../types.ts";

// Polar Night
const nord0 = "#2e3440";
const nord1 = "#3b4252";
const nord2 = "#434c5e";
const nord3 = "#4c566a";
// Snow Storm
const nord4 = "#d8dee9";
const nord5 = "#e5e9f0";
const nord6 = "#eceff4";
// Frost
const nord7 = "#8fbcbb";
const nord8 = "#88c0d0";
const nord9 = "#81a1c1";
const nord10 = "#5e81ac";
// Aurora
const nord11 = "#bf616a";
const nord12 = "#d08770";
const nord13 = "#ebcb8b";
const nord14 = "#a3be8c";
const nord15 = "#b48ead";

const palette: Palette = {
  bg0: nord0,
  bg1: nord1,
  bg2: nord2,
  bg3: nord3,
  // Ignored files and unfocused tabs: nord3 is only 1.7:1 on nord0
  bg4: nord10,
  grey: nord10,
  fg0: nord6,
  fg1: nord4,
  fg2: nord4,
  fg3: nord4,
  fg4: nord4,
  red1: nord11,
  red2: nord11,
  green1: nord14,
  green2: nord14,
  yellow1: nord13,
  yellow2: nord13,
  // nord10 for filled backgrounds (buttons, badges), nord9 for text and marks
  blue1: nord10,
  blue2: nord9,
  purple1: nord15,
  purple2: nord15,
  // nord8 is Nord's primary accent: active tab, progress, selection
  aqua1: nord8,
  aqua2: nord7,
  orange1: nord12,
  orange2: nord12,
  transparent: "#0000",
  // Badge text; reads better than nord6 on nord10
  white: nord0,
};

const syntax: SyntaxRoles = {
  text: palette.fg1,
  comment: nord13,
  string: nord14,
  constant: nord15,
  definition: nord8,
  // Same as text: no Nord color is between nord3 and nord4
  punctuation: nord4,
  invalid: nord11,
  inserted: nord14,
  deleted: nord11,
  changed: nord9,
};

// The official Nord terminal palette
const terminal = {
  "terminal.ansiBlack": nord1,
  "terminal.ansiRed": nord11,
  "terminal.ansiGreen": nord14,
  "terminal.ansiYellow": nord13,
  "terminal.ansiBlue": nord9,
  "terminal.ansiMagenta": nord15,
  "terminal.ansiCyan": nord8,
  "terminal.ansiWhite": nord5,
  "terminal.ansiBrightBlack": nord3,
  "terminal.ansiBrightRed": nord11,
  "terminal.ansiBrightGreen": nord14,
  "terminal.ansiBrightYellow": nord13,
  "terminal.ansiBrightBlue": nord9,
  "terminal.ansiBrightMagenta": nord15,
  "terminal.ansiBrightCyan": nord7,
  "terminal.ansiBrightWhite": nord6,
};

export const nordVariants: Variant[] = [
  {
    id: "soy-nord",
    label: "Soy Nord",
    type: "dark",
    palette,
    syntax,
    uiOverrides: terminal,
  },
];
