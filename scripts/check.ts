// Checks every variant for consistency and readable contrast.
//
// Mistakes (exit code 1): the syntax text color differs from the editor
// foreground, a color is not an opaque #rrggbb hex, or themes/ and
// package.json don't match what the build would write.
// Warnings: a color is below its contrast target against the background.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import process from "node:process";
import { contrastRatio } from "../src/color.ts";
import {
  generateTheme,
  manifestThemes,
  themeFileName,
  toJson,
} from "../src/theme.ts";
import type { Hex, PaletteKey, SyntaxRoles } from "../src/types.ts";
import { variants } from "../src/variants.ts";

// Body text should meet WCAG AA (4.5:1); highlights and secondary text 3:1.
const syntaxTargets: Record<keyof SyntaxRoles, number> = {
  text: 4.5,
  comment: 3,
  string: 3,
  constant: 3,
  definition: 3,
  punctuation: 3,
  invalid: 3,
  inserted: 3,
  deleted: 3,
  changed: 3,
};

// Palette slots used as text on the background
const uiTextTargets: Partial<Record<PaletteKey, number>> = {
  fg1: 4.5, // editor, tabs, status bar
  fg2: 4.5, // sidebar
  fg3: 3,
  fg4: 3, // inactive tabs
  grey: 3, // unfocused inactive tabs
  bg4: 3, // ignored files
};

const opaqueHex = /^#[0-9a-f]{6}$/i;

const mistakes: string[] = [];
const warnings: string[] = [];

const checkContrast = (
  variant: string,
  name: string,
  fg: Hex,
  bg: Hex,
  target: number,
) => {
  const ratio = contrastRatio(fg, bg);
  if (ratio < target) {
    warnings.push(
      `${variant}: ${name} ${fg} on ${bg} is ${
        ratio.toFixed(2)
      }:1, target ${target}:1`,
    );
  }
};

for (const { id, palette, syntax } of variants) {
  for (
    const [key, color] of [
      ...Object.entries(palette),
      ...Object.entries(syntax),
    ]
  ) {
    if (key !== "transparent" && !opaqueHex.test(color)) {
      mistakes.push(`${id}: ${key} is ${color}, expected #rrggbb`);
    }
  }
  if (syntax.text !== palette.fg1) {
    mistakes.push(
      `${id}: syntax text ${syntax.text} must equal fg1 ${palette.fg1}`,
    );
  }

  for (const [role, target] of Object.entries(syntaxTargets)) {
    const color = syntax[role as keyof SyntaxRoles];
    checkContrast(id, `syntax ${role}`, color, palette.bg0, target);
  }
  for (const [key, target] of Object.entries(uiTextTargets)) {
    const color = palette[key as PaletteKey];
    checkContrast(id, `ui ${key}`, color, palette.bg0, target);
  }
  // Badge text on its two badge backgrounds
  checkContrast(id, "ui white on purple1", palette.white, palette.purple1, 3);
  checkContrast(id, "ui white on blue1", palette.white, palette.blue1, 3);
}

// Generated files must match the source
const themesDir = new URL("../themes/", import.meta.url);
for (const variant of variants) {
  const file = new URL(themeFileName(variant), themesDir);
  if (
    !existsSync(file) ||
    readFileSync(file, "utf8") !== toJson(generateTheme(variant))
  ) {
    mistakes.push(`themes/${themeFileName(variant)} is out of date; run build`);
  }
}
const themeFiles = new Set(variants.map(themeFileName));
for (const name of readdirSync(themesDir)) {
  if (name.endsWith(".json") && !themeFiles.has(name)) {
    mistakes.push(`themes/${name} is not a variant; run build`);
  }
}
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
if (
  JSON.stringify(pkg.contributes?.themes) !==
    JSON.stringify(manifestThemes(variants))
) {
  mistakes.push("package.json contributes.themes is out of date; run build");
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
for (const mistake of mistakes) console.error(`error: ${mistake}`);
console.log(
  `Checked ${variants.length} variants: ${mistakes.length} errors, ${warnings.length} warnings`,
);
if (mistakes.length > 0) process.exit(1);
