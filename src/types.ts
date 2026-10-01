export type Hex = `#${string}`;

export type ColorScheme = "dark" | "light";

// Palette slots follow Gruvbox's naming: `bg0`–`bg4` and `fg0`–`fg4` step away
// from the editor background and foreground, and each accent has a neutral
// shade (`1`) and a text-contrast shade (`2`, bright on dark, faded on light).
export type PaletteKey =
  | "bg0"
  | "bg1"
  | "bg2"
  | "bg3"
  | "bg4"
  | "grey"
  | "fg0"
  | "fg1"
  | "fg2"
  | "fg3"
  | "fg4"
  | "red1"
  | "red2"
  | "green1"
  | "green2"
  | "yellow1"
  | "yellow2"
  | "blue1"
  | "blue2"
  | "purple1"
  | "purple2"
  | "aqua1"
  | "aqua2"
  | "orange1"
  | "orange2"
  | "transparent"
  | "white";

export type Palette = Record<PaletteKey, Hex>;

// The only colors used for code in the editor.
export type SyntaxRoles = {
  // Everything not listed below: keywords, variables, calls, operators, types.
  // Must be the palette's fg1, which is the editor foreground.
  text: Hex;
  // Prominent, not dimmed: comments are worth reading
  comment: Hex;
  // Strings and regular expressions
  string: Hex;
  // Literals: numbers, booleans, null, symbols
  constant: Hex;
  // Names of functions, classes, types and modules where they are defined
  definition: Hex;
  // Slightly dimmed so names stand out
  punctuation: Hex;
  invalid: Hex;
  // Diffs
  inserted: Hex;
  deleted: Hex;
  changed: Hex;
};

export type Variant = {
  // File name stem in themes/, e.g. "soy-gruvbox-dark-medium"
  id: string;
  // Name shown in the theme picker
  label: string;
  type: ColorScheme;
  palette: Palette;
  syntax: SyntaxRoles;
  // Workbench colors that replace the generated ones, e.g. a palette's
  // official terminal colors
  uiOverrides?: Record<string, string>;
};

export type ColorsGetter = (palette: Palette) => Record<string, string>;
