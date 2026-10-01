import type { Variant } from "./types.ts";
import { getBaseColors } from "./ui/base.ts";
import { getGitLensColors } from "./ui/extensions/gitlens.ts";
import { getJupyterNotebookColors } from "./ui/extensions/jupyter-notebook.ts";
import { getTokenColors } from "./syntax/tokens.ts";
import { getSemanticTokenColors } from "./syntax/semantic.ts";

export const generateTheme = (
  { label, type, palette, syntax, uiOverrides }: Variant,
) => ({
  $schema: "vscode://schemas/color-theme",
  name: label,
  type,
  colors: {
    ...getBaseColors(palette),
    ...getJupyterNotebookColors(palette),
    ...getGitLensColors(palette),
    ...uiOverrides,
  },
  tokenColors: getTokenColors(syntax),
  semanticHighlighting: true,
  semanticTokenColors: getSemanticTokenColors(syntax),
});

export const toJson = (value: unknown): string =>
  `${JSON.stringify(value, undefined, 2)}\n`;

// The file in themes/ for a variant
export const themeFileName = ({ id }: Variant): string => `${id}.json`;

// The extension manifest's `contributes.themes`
export const manifestThemes = (variants: Variant[]) =>
  variants.map((variant) => ({
    label: variant.label,
    uiTheme: variant.type === "dark" ? "vs-dark" : "vs",
    path: `./themes/${themeFileName(variant)}`,
  }));
