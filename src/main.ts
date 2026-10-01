import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { variants } from "./variants.ts";
import {
  generateTheme,
  manifestThemes,
  themeFileName,
  toJson,
} from "./theme.ts";

const themesDir = new URL("../themes/", import.meta.url);
const packageJsonFile = new URL("../package.json", import.meta.url);

// Keep the extension manifest's theme list in sync with `variants`.
const syncPackageJson = async () => {
  const original = await readFile(packageJsonFile, "utf8");
  const pkg = JSON.parse(original);
  pkg.contributes = { ...pkg.contributes, themes: manifestThemes(variants) };
  const updated = toJson(pkg);
  if (updated !== original) await writeFile(packageJsonFile, updated);
};

// Remove theme files of variants that no longer exist.
const removeStaleThemes = async () => {
  const current = new Set(variants.map(themeFileName));
  for (const name of await readdir(themesDir)) {
    if (name.endsWith(".json") && !current.has(name)) {
      await rm(new URL(name, themesDir));
    }
  }
};

await mkdir(themesDir, { recursive: true });
await Promise.all([
  ...variants.map((variant) =>
    writeFile(
      new URL(themeFileName(variant), themesDir),
      toJson(generateTheme(variant)),
    )
  ),
  syncPackageJson(),
  removeStaleThemes(),
]);
console.log(`Generated ${variants.length} themes`);
