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
