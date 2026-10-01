// Renders images/icon.svg to images/icon.png, the extension icon shown in the
// marketplace, which accepts PNG but not SVG. Needs Chrome, Chromium or Edge.
//
// Usage: deno task icon [--chrome <path>]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { findChrome } from "./lib/chrome.ts";

const { values: options } = parseArgs({
  options: {
    chrome: { type: "string" },
  },
});

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const chrome = options.chrome ?? findChrome() ??
  fail("Could not find Chrome, Chromium or Edge; pass --chrome <path>");

const svgFile = "images/icon.svg";
const pngFile = path.resolve("images/icon.png");
const size = 256;

const svg = readFileSync(svgFile, "utf8");
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; background: transparent; }
  svg { display: block; width: ${size}px; height: ${size}px; }
</style></head><body>${svg}</body></html>`;

const tempDir = mkdtempSync(path.join(os.tmpdir(), "soy-icon-"));
try {
  const htmlFile = path.join(tempDir, "icon.html");
  writeFileSync(htmlFile, html);
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    `--user-data-dir=${path.join(tempDir, "profile")}`,
    `--window-size=${size},${size}`,
    "--force-device-scale-factor=1",
    // Keep the corners outside the rounded square transparent
    "--default-background-color=00000000",
    `--screenshot=${pngFile}`,
    pathToFileURL(htmlFile).href,
  ], { stdio: "ignore" });
  console.log(`Wrote ${path.relative(".", pngFile)}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
