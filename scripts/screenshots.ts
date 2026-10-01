// Renders a preview image of every variant to images/<id>.png: a simplified
// VS Code window drawn with the theme's colors, with code colored by VS Code's
// own grammars and TextMate engine. Needs Chrome, Chromium or Edge.
//
// Usage: deno task screenshots [--variant <id>] [--chrome <path>]
//                              [--extensions <dir>]
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { generateTheme } from "../src/theme.ts";
import { variants } from "../src/variants.ts";
import {
  createHighlighter,
  findExtensionsDir,
  FontStyle,
  type Theme,
  type Token,
} from "./lib/textmate.ts";

const { values: options } = parseArgs({
  options: {
    variant: { type: "string" },
    chrome: { type: "string" },
    extensions: { type: "string" },
  },
});

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const findChrome = (): string | undefined => {
  const { LOCALAPPDATA, ProgramFiles, PATH = "" } = process.env;
  const candidates = process.platform === "darwin"
    ? [
      "Google Chrome.app/Contents/MacOS/Google Chrome",
      "Chromium.app/Contents/MacOS/Chromium",
      "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ].map((app) => `/Applications/${app}`)
    : process.platform === "win32"
    ? [
      `${ProgramFiles}/Google/Chrome/Application/chrome.exe`,
      `${LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      `${ProgramFiles} (x86)/Microsoft/Edge/Application/msedge.exe`,
    ]
    : ["google-chrome", "chromium", "chromium-browser", "microsoft-edge"]
      .flatMap((name) =>
        PATH.split(path.delimiter).map((dir) => path.join(dir, name))
      );
  return candidates.find((file) => existsSync(file));
};

const chrome = options.chrome ?? findChrome() ??
  fail("Could not find Chrome, Chromium or Edge; pass --chrome <path>");
const extensionsDir = options.extensions ?? findExtensionsDir() ??
  fail("Could not find VS Code's built-in extensions; pass --extensions <dir>");

// What the preview shows
const sampleFile = "samples/sample.ts";
const firstLine = 1;
const lastLine = 34;
const cursor = { line: 9, column: 34 };

const width = 1100;
const height = 760;
const lineHeight = 20;

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const tokenHtml = ({ text, color, fontStyle }: Token) => {
  const styles = [`color:${color}`];
  if (fontStyle & FontStyle.italic) styles.push("font-style:italic");
  if (fontStyle & FontStyle.bold) styles.push("font-weight:bold");
  const decorations = [
    fontStyle & FontStyle.underline && "underline",
    fontStyle & FontStyle.strikethrough && "line-through",
  ].filter(Boolean);
  if (decorations.length) {
    styles.push(`text-decoration:${decorations.join(" ")}`);
  }
  return `<span style="${styles.join(";")}">${escapeHtml(text)}</span>`;
};

// Split tokens at `column` to place the cursor there
const lineHtml = (tokens: Token[], cursorColumn?: number) => {
  let column = 0;
  return tokens.map((token) => {
    const start = column;
    column += token.text.length;
    if (
      cursorColumn === undefined || cursorColumn < start ||
      cursorColumn >= column
    ) {
      return tokenHtml(token);
    }
    const at = cursorColumn - start;
    return tokenHtml({ ...token, text: token.text.slice(0, at) }) +
      `<span class="cursor"></span>` +
      tokenHtml({ ...token, text: token.text.slice(at) });
  }).join("");
};

const icons = {
  files:
    `<path d="M14 3H7v18h12V8z M14 3v5h5" fill="none" stroke-width="1.5" stroke-linejoin="round"/>`,
  search:
    `<circle cx="10" cy="10" r="6" fill="none" stroke-width="1.5"/><path d="M14.5 14.5 20 20" stroke-width="1.5"/>`,
  git:
    `<circle cx="7" cy="5" r="2" fill="none" stroke-width="1.5"/><circle cx="7" cy="19" r="2" fill="none" stroke-width="1.5"/><circle cx="17" cy="9" r="2" fill="none" stroke-width="1.5"/><path d="M7 7v10 M17 11c0 4-10 2-10 6" fill="none" stroke-width="1.5"/>`,
  extensions:
    `<path d="M4 9h6v6H4z M10 15h6v6h-6z M4 15h6v6H4z M13 4h6v6h-6z" fill="none" stroke-width="1.5"/>`,
};

const pageHtml = (theme: Theme, code: string) => {
  const c = (key: string, fallback = "transparent"): string =>
    (theme.colors as Record<string, string>)[key] ?? fallback;
  const fg = c("foreground");
  const icon = (name: keyof typeof icons, active = false, badge?: string) =>
    `<div class="icon${
      active ? " active" : ""
    }"><svg viewBox="0 0 24 24" stroke="${
      active
        ? c("activityBar.foreground")
        : c("activityBar.inactiveForeground", c("activityBar.foreground"))
    }">${icons[name]}</svg>${
      badge ? `<span class="badge">${badge}</span>` : ""
    }</div>`;
  const item = (
    depth: number,
    label: string,
    {
      color = c("sideBar.foreground", fg),
      decoration = "",
      selected = false,
      folder = false,
    } = {},
  ) =>
    `<div class="item${selected ? " selected" : ""}" style="padding-left:${
      8 + depth * 12
    }px;color:${
      selected ? c("list.activeSelectionForeground", color) : color
    }">` +
    `<span class="twistie">${
      folder ? "⌄" : ""
    }</span><span class="label">${label}</span>` +
    `<span class="decoration">${decoration}</span></div>`;
  const modified = c("gitDecoration.modifiedResourceForeground", fg);
  const untracked = c("gitDecoration.untrackedResourceForeground", fg);
  const ignored = c("gitDecoration.ignoredResourceForeground", fg);

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${width}px; height: ${height}px; overflow: hidden;
    display: grid; grid-template: 1fr 22px / 48px 230px 1fr;
    font: 13px -apple-system, "Segoe UI", system-ui, sans-serif; color: ${fg};
  }
  .activitybar {
    background: ${c("activityBar.background")};
    border-right: 1px solid ${c("activityBar.border")};
  }
  .icon { position: relative; height: 48px; display: grid; place-items: center; }
  .icon.active { box-shadow: inset 2px 0 ${
    c("activityBar.activeBorder", c("activityBar.foreground"))
  }; }
  .icon svg { width: 24px; height: 24px; }
  .icon:not(.active) svg { opacity: 0.6; }
  .badge {
    position: absolute; right: 8px; bottom: 8px; min-width: 16px; height: 16px;
    padding: 0 4px; border-radius: 8px; font-size: 9px; line-height: 16px;
    text-align: center; background: ${c("activityBarBadge.background")};
    color: ${c("activityBarBadge.foreground")};
  }
  .sidebar {
    background: ${c("sideBar.background")};
    border-right: 1px solid ${c("sideBar.border")};
    color: ${c("sideBar.foreground", fg)};
  }
  .sidebar .title {
    height: 35px; padding: 0 20px; line-height: 35px; font-size: 11px;
    color: ${c("sideBarTitle.foreground", fg)};
  }
  .sidebar .section {
    height: 22px; padding: 0 8px; line-height: 22px; font-size: 11px; font-weight: bold;
    background: ${c("sideBarSectionHeader.background")};
    color: ${c("sideBarSectionHeader.foreground", fg)};
  }
  .item { display: flex; height: 22px; line-height: 22px; padding-right: 12px; }
  .item.selected { background: ${c("list.activeSelectionBackground")}; }
  .twistie { width: 16px; text-align: center; }
  .label { flex: 1; }
  .decoration { font-size: 12px; }
  .main { display: grid; grid-template-rows: 35px 1fr; min-width: 0; }
  .tabs {
    display: flex; background: ${c("editorGroupHeader.tabsBackground")};
    box-shadow: inset 0 -1px ${c("editorGroupHeader.tabsBorder")};
  }
  .tab {
    padding: 0 16px; line-height: 35px; border-right: 1px solid ${
    c("tab.border")
  };
    background: ${c("tab.inactiveBackground")}; color: ${
    c("tab.inactiveForeground", fg)
  };
  }
  .tab.active {
    background: ${c("tab.activeBackground")}; color: ${
    c("tab.activeForeground", fg)
  };
    box-shadow: inset 0 -1px ${c("tab.activeBorder")};
  }
  .editor {
    position: relative; overflow: hidden; padding-top: 4px;
    background: ${c("editor.background")};
    font: 13px/${lineHeight}px Menlo, Consolas, "DejaVu Sans Mono", monospace;
  }
  .line { display: flex; height: ${lineHeight}px; white-space: pre; }
  .line.current { background: ${c("editor.lineHighlightBackground")}; }
  .number {
    width: 64px; padding-right: 26px; text-align: right;
    color: ${c("editorLineNumber.foreground")};
  }
  .current .number { color: ${
    c("editorLineNumber.activeForeground", c("editor.foreground"))
  }; }
  .cursor {
    display: inline-block; width: 2px; height: ${lineHeight}px; margin-right: -2px;
    vertical-align: top; background: ${c("editorCursor.foreground")};
  }
  .scrollbar {
    position: absolute; top: 0; right: 0; width: 14px; height: 45%;
    background: ${c("scrollbarSlider.background")};
  }
  .statusbar {
    grid-column: 1 / -1; display: flex; gap: 16px; padding: 0 10px;
    line-height: 22px; font-size: 12px;
    background: ${c("statusBar.background")}; color: ${
    c("statusBar.foreground", fg)
  };
    box-shadow: inset 0 1px ${c("statusBar.border")};
  }
  .statusbar .spacer { flex: 1; }
</style></head><body>
<div class="activitybar">
  ${icon("files", true)}${icon("search")}${icon("git", false, "3")}${
    icon("extensions")
  }
</div>
<div class="sidebar">
  <div class="title">EXPLORER</div>
  <div class="section">⌄ VSCODE-THEME-SOY</div>
  ${item(0, "dist", { color: ignored })}
  ${item(0, "samples", { folder: true })}
  ${item(1, "sample.go")}
  ${item(1, "sample.py")}
  ${item(1, "sample.rs")}
  ${item(1, "sample.ts", { selected: true })}
  ${item(0, "src", { folder: true, color: modified, decoration: "●" })}
  ${item(1, "main.ts", { color: modified, decoration: "M" })}
  ${item(1, "theme.ts", { color: untracked, decoration: "U" })}
  ${item(1, "types.ts")}
  ${item(0, "LICENSE")}
  ${item(0, "README.md")}
  ${item(0, "package.json")}
</div>
<div class="main">
  <div class="tabs">
    <div class="tab active">sample.ts</div>
    <div class="tab" style="color:${modified}">main.ts</div>
    <div class="tab">README.md</div>
  </div>
  <div class="editor">${code}<div class="scrollbar"></div></div>
</div>
<div class="statusbar">
  <span>main</span><span>⊗ 0 ⚠ 0</span><span class="spacer"></span>
  <span>Ln ${cursor.line}, Col ${cursor.column + 1}</span><span>Spaces: 2</span>
  <span>UTF-8</span><span>TypeScript</span>
</div>
</body></html>`;
};

const { highlight } = await createHighlighter(extensionsDir);
const selected = options.variant
  ? variants.filter(({ id }) => id === options.variant)
  : variants;
if (selected.length === 0) fail(`Unknown variant ${options.variant}`);

const outDir = "images";
mkdirSync(outDir, { recursive: true });
const tempDir = mkdtempSync(path.join(os.tmpdir(), "soy-screenshots-"));
try {
  for (const variant of selected) {
    const theme = generateTheme(variant);
    const result = await highlight(sampleFile, theme) ??
      fail(`No grammar for ${sampleFile}`);
    const code = result.lines.slice(firstLine - 1, lastLine).map(
      ({ tokens }, index) => {
        const number = firstLine + index;
        const current = number === cursor.line;
        return `<div class="line${current ? " current" : ""}">` +
          `<span class="number">${number}</span>` +
          `<span>${
            lineHtml(tokens, current ? cursor.column : undefined)
          }</span></div>`;
      },
    ).join("");

    const htmlFile = path.join(tempDir, `${variant.id}.html`);
    writeFileSync(htmlFile, pageHtml(theme, code));
    const pngFile = path.resolve(outDir, `${variant.id}.png`);
    execFileSync(chrome, [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      `--user-data-dir=${path.join(tempDir, "profile")}`,
      `--window-size=${width},${height}`,
      "--force-device-scale-factor=2",
      `--screenshot=${pngFile}`,
      pathToFileURL(htmlFile).href,
    ], { stdio: "ignore" });
    console.log(`Wrote ${path.relative(".", pngFile)}`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
