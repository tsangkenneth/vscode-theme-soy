// Adapted from https://github.com/jdinhify/vscode-theme-gruvbox
// (src/colors/extensions/jupyter-notebook.ts), MIT License, Copyright © 2017 JD
import type { ColorsGetter } from "../../types.ts";

export const getJupyterNotebookColors: ColorsGetter = (palette) => {
  const { bg1, fg4, bg2 } = palette;

  return {
    "notebook.cellEditorBackground": bg1,
    "notebook.focusedCellBorder": fg4,
    "notebook.cellBorderColor": bg2,
    "notebook.focusedEditorBorder": bg2,
  };
};
