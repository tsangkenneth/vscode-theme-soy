// Shows how a variant colors source files, using VS Code's own grammars and
// TextMate engine, so syntax rules can be checked without opening VS Code.
// Semantic highlighting needs a language server, so it is not shown here.
//
// Usage: deno task preview [options] [file...]
//   --variant <id>      variant to use (default: the first in src/variants.ts)
//   --plain             mark colored tokens as [text|role] instead of using
//                       terminal colors (the default when not in a terminal)
//   --color             use terminal colors even when not in a terminal,
//                       e.g. to pipe into `less -R`
//   --scopes <text>     also print the scopes of tokens containing <text>
//   --extensions <dir>  VS Code's built-in extensions folder (default: found
//                       in the usual install locations)
// Files default to everything in samples/.
import { readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import { generateTheme } from "../src/theme.ts";
import type { SyntaxRoles } from "../src/types.ts";
import { variants } from "../src/variants.ts";
import {
  createHighlighter,
  findExtensionsDir,
  FontStyle,
  type Token,
} from "./lib/textmate.ts";

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    variant: { type: "string" },
    plain: { type: "boolean", default: false },
    color: { type: "boolean", default: false },
    scopes: { type: "string" },
    extensions: { type: "string" },
  },
});
const plain = options.plain || (!options.color && !process.stdout.isTTY);

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const extensionsDir = options.extensions ?? findExtensionsDir() ??
  fail("Could not find VS Code's built-in extensions; pass --extensions <dir>");

const variant = options.variant
  ? variants.find(({ id }) => id === options.variant) ??
    fail(
      `Unknown variant ${options.variant}; one of:\n  ${
        variants.map(({ id }) => id).join("\n  ")
      }`,
    )
  : variants[0];
const theme = generateTheme(variant);

// Name colors by syntax role. Earlier roles win when two share a color.
const roleOrder: (keyof SyntaxRoles)[] = [
  "text",
  "comment",
  "string",
  "constant",
  "definition",
  "punctuation",
  "invalid",
  "inserted",
  "deleted",
  "changed",
];
const roleByColor = new Map<string, string>();
for (const role of roleOrder) {
  const color = variant.syntax[role].toUpperCase();
  if (!roleByColor.has(color)) roleByColor.set(color, role);
}

const ansiColor = (hex: string, layer: 38 | 48) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `\x1b[${layer};2;${r};${g};${b}m`;
};
const ansiFontStyles: [number, string][] = [
  [FontStyle.italic, "\x1b[3m"],
  [FontStyle.bold, "\x1b[1m"],
  [FontStyle.underline, "\x1b[4m"],
  [FontStyle.strikethrough, "\x1b[9m"],
];
const background = ansiColor(theme.colors["editor.background"], 48);
const lineNumberColor = ansiColor(
  theme.colors["editorLineNumber.foreground"],
  38,
);

const renderAnsi = (tokens: Token[]) =>
  tokens.map(({ text, color, fontStyle }) =>
    ansiColor(color, 38) +
    ansiFontStyles.map(([bit, code]) => fontStyle & bit ? code : "").join("") +
    text + "\x1b[23;22;24;29m"
  ).join("");

const roleLabel = ({ color, fontStyle }: Token) => {
  let label = roleByColor.get(color.toUpperCase()) ?? color;
  if (fontStyle & FontStyle.italic) label += "+italic";
  if (fontStyle & FontStyle.bold) label += "+bold";
  if (fontStyle & FontStyle.strikethrough) label += "+strikethrough";
  return label;
};

// Plain text with colored runs marked as [text|role]; whitespace joins the
// surrounding run.
const renderPlain = (tokens: Token[]) => {
  const runs: { label: string; text: string }[] = [];
  for (const token of tokens) {
    const last = runs.at(-1);
    const label = roleLabel(token);
    if (last && (last.label === label || /^\s+$/.test(token.text))) {
      last.text += token.text;
    } else {
      runs.push({ label, text: token.text });
    }
  }
  return runs.map(({ label, text }) =>
    label === "text" ? text : `[${text}|${label}]`
  ).join("");
};

const files = positionals.length > 0
  ? positionals
  : readdirSync("samples").sort().map((name) => path.join("samples", name));

const { highlight } = await createHighlighter(extensionsDir);

console.log(`${variant.label} (${variant.id})`);
for (const file of files) {
  const result = await highlight(file, theme);
  if (!result) {
    console.log(`\n=== ${file}: no grammar found, skipped`);
    continue;
  }
  console.log(`\n=== ${file} (${result.scopeName})`);

  const width = String(result.lines.length).length;
  result.lines.forEach(({ tokens, scopes }, index) => {
    const number = String(index + 1).padStart(width);
    console.log(
      plain
        ? `${number}| ${renderPlain(tokens)}`
        : `${background}${lineNumberColor}${number}  ${
          renderAnsi(tokens)
        }\x1b[K\x1b[0m`,
    );
    if (options.scopes) {
      for (const token of scopes) {
        if (token.text.includes(options.scopes)) {
          console.log(
            `${" ".repeat(width)}  "${token.text}": ${token.scopes.join(" ")}`,
          );
        }
      }
    }
  });
}
