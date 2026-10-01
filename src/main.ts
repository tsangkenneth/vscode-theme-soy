import { mkdir, readFile, writeFile } from "node:fs/promises";
import { variants } from "./variants.ts";
import { generateTheme } from "./theme.ts";

const themesDir = new URL("../themes/", import.meta.url);
const packageJsonFile = new URL("../package.json", import.meta.url);

const toJson = (value: unknown) => `${JSON.stringify(value, undefined, 2)}\n`;

// Keep the extension manifest's theme list in sync with `variants`.
const syncPackageJson = async () => {
  const original = await readFile(packageJsonFile, "utf8");
  const pkg = JSON.parse(original);
  pkg.contributes = {
    ...pkg.contributes,
    themes: variants.map(({ id, label, type }) => ({
      label,
      uiTheme: type === "dark" ? "vs-dark" : "vs",
      path: `./themes/${id}.json`,
    })),
  };
  const updated = toJson(pkg);
  if (updated !== original) await writeFile(packageJsonFile, updated);
};

await mkdir(themesDir, { recursive: true });
await Promise.all([
  ...variants.map((variant) =>
    writeFile(
      new URL(`${variant.id}.json`, themesDir),
      toJson(generateTheme(variant)),
    )
  ),
  syncPackageJson(),
]);
console.log(`Generated ${variants.length} themes`);
