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
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import oniguruma from "vscode-oniguruma";
import vsctm from "vscode-textmate";
import { generateTheme } from "../src/theme.ts";
import type { SyntaxRoles } from "../src/types.ts";
import { variants } from "../src/variants.ts";

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

// Find VS Code's grammars

const installLocations = (): string[] => {
  const { HOME, LOCALAPPDATA, ProgramFiles } = process.env;
  const app = "resources/app/extensions";
  switch (process.platform) {
    case "darwin":
      return [
        "/Applications/Visual Studio Code.app",
        `${HOME}/Applications/Visual Studio Code.app`,
        "/Applications/Visual Studio Code - Insiders.app",
      ].map((dir) => `${dir}/Contents/Resources/app/extensions`);
    case "win32":
      return [
        `${LOCALAPPDATA}/Programs/Microsoft VS Code/${app}`,
        `${ProgramFiles}/Microsoft VS Code/${app}`,
      ];
    default:
      return [
        `/usr/share/code/${app}`,
        `/opt/visual-studio-code/${app}`,
        `/snap/code/current/usr/share/code/${app}`,
      ];
  }
};

const extensionsDir = options.extensions ??
  installLocations().find((dir) => existsSync(dir)) ??
  fail(
    "Could not find VS Code's built-in extensions; pass --extensions <dir>",
  );

const grammarFiles = new Map<string, string>();
const injections = new Map<string, string[]>();
const languageByExtension = new Map<string, string>();
const languageByFilename = new Map<string, string>();
const scopeByLanguage = new Map<string, string>();

for (const name of readdirSync(extensionsDir)) {
  const manifest = path.join(extensionsDir, name, "package.json");
  if (!existsSync(manifest)) continue;
  const { contributes = {} } = JSON.parse(readFileSync(manifest, "utf8"));
  for (const language of contributes.languages ?? []) {
    for (const ext of language.extensions ?? []) {
      if (!languageByExtension.has(ext)) {
        languageByExtension.set(ext, language.id);
      }
    }
    for (const filename of language.filenames ?? []) {
      languageByFilename.set(filename, language.id);
    }
  }
  for (const grammar of contributes.grammars ?? []) {
    grammarFiles.set(
      grammar.scopeName,
      path.join(extensionsDir, name, grammar.path),
    );
    if (grammar.language && !scopeByLanguage.has(grammar.language)) {
      scopeByLanguage.set(grammar.language, grammar.scopeName);
    }
    for (const target of grammar.injectTo ?? []) {
      injections.set(target, [
        ...(injections.get(target) ?? []),
        grammar.scopeName,
      ]);
    }
  }
}

const scopeForFile = (file: string) => {
  const language = languageByFilename.get(path.basename(file)) ??
    languageByExtension.get(path.extname(file).toLowerCase());
  return language && scopeByLanguage.get(language);
};

// Set up the TextMate engine with the variant's theme

const variant = options.variant
  ? variants.find(({ id }) => id === options.variant) ??
    fail(
      `Unknown variant ${options.variant}; one of:\n  ${
        variants.map(({ id }) => id).join("\n  ")
      }`,
    )
  : variants[0];
const theme = generateTheme(variant);

const require = createRequire(import.meta.url);
await oniguruma.loadWASM(
  readFileSync(require.resolve("vscode-oniguruma/release/onig.wasm")),
);

const registry = new vsctm.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: (sources: string[]) =>
      new oniguruma.OnigScanner(sources),
    createOnigString: (text: string) => new oniguruma.OnigString(text),
  }),
  loadGrammar: (scopeName: string) => {
    const file = grammarFiles.get(scopeName);
    return Promise.resolve(
      file && existsSync(file)
        ? vsctm.parseRawGrammar(readFileSync(file, "utf8"), file)
        : null,
    );
  },
  getInjections: (scopeName: string) => injections.get(scopeName),
});
registry.setTheme({
  name: theme.name,
  settings: [
    {
      settings: {
        foreground: theme.colors["editor.foreground"],
        background: theme.colors["editor.background"],
      },
    },
    ...theme.tokenColors,
  ],
});
const colorMap = registry.getColorMap();

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

// Bit layout of vscode-textmate's encoded token metadata
const fontStyleOf = (metadata: number) => (metadata & 0x00007800) >>> 11;
const foregroundOf = (metadata: number) =>
  colorMap[(metadata & 0x00ff8000) >>> 15];

const ansiColor = (hex: string, layer: 38 | 48) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `\x1b[${layer};2;${r};${g};${b}m`;
};
const ansiFontStyles: [number, string][] = [
  [1, "\x1b[3m"], // italic
  [2, "\x1b[1m"], // bold
  [4, "\x1b[4m"], // underline
  [8, "\x1b[9m"], // strikethrough
];
const background = ansiColor(theme.colors["editor.background"], 48);
const lineNumberColor = ansiColor(
  theme.colors["editorLineNumber.foreground"],
  38,
);

type Token = { text: string; color: string; fontStyle: number };

const renderAnsi = (tokens: Token[]) =>
  tokens.map(({ text, color, fontStyle }) =>
    ansiColor(color, 38) +
    ansiFontStyles.map(([bit, code]) => fontStyle & bit ? code : "").join("") +
    text + "\x1b[23;22;24;29m"
  ).join("");

const roleLabel = ({ color, fontStyle }: Token) => {
  let label = roleByColor.get(color.toUpperCase()) ?? color;
  if (fontStyle & 1) label += "+italic";
  if (fontStyle & 2) label += "+bold";
  if (fontStyle & 8) label += "+strikethrough";
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

console.log(`${variant.label} (${variant.id})`);
for (const file of files) {
  const scopeName = scopeForFile(file);
  const grammar = scopeName && await registry.loadGrammar(scopeName);
  if (!grammar) {
    console.log(`\n=== ${file}: no grammar found, skipped`);
    continue;
  }
  console.log(`\n=== ${file} (${scopeName})`);

  const lines = readFileSync(file, "utf8").replace(/\n$/, "").split("\n");
  const width = String(lines.length).length;
  let ruleStack = vsctm.INITIAL;
  lines.forEach((line, index) => {
    const { tokens: encoded, ruleStack: next } = grammar.tokenizeLine2(
      line,
      ruleStack,
    );
    const tokens: Token[] = [];
    for (let i = 0; i < encoded.length; i += 2) {
      const end = i + 2 < encoded.length ? encoded[i + 2] : line.length;
      tokens.push({
        text: line.slice(encoded[i], end),
        color: foregroundOf(encoded[i + 1]),
        fontStyle: fontStyleOf(encoded[i + 1]),
      });
    }

    const number = String(index + 1).padStart(width);
    console.log(
      plain
        ? `${number}| ${renderPlain(tokens)}`
        : `${background}${lineNumberColor}${number}  ${
          renderAnsi(tokens)
        }\x1b[K\x1b[0m`,
    );

    if (options.scopes) {
      for (const token of grammar.tokenizeLine(line, ruleStack).tokens) {
        const text = line.slice(token.startIndex, token.endIndex);
        if (text.includes(options.scopes)) {
          console.log(
            `${" ".repeat(width)}  "${text}": ${token.scopes.join(" ")}`,
          );
        }
      }
    }
    ruleStack = next;
  });
}
