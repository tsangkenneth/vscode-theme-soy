// Colors files the way VS Code does, using the grammars of the local VS Code
// installation and VS Code's TextMate engine. Semantic highlighting needs a
// language server, so only TextMate token colors are available.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import oniguruma from "vscode-oniguruma";
import vsctm from "vscode-textmate";
import type { generateTheme } from "../../src/theme.ts";

export type Theme = ReturnType<typeof generateTheme>;

// Bit flags in Token.fontStyle
export const FontStyle = {
  italic: 1,
  bold: 2,
  underline: 4,
  strikethrough: 8,
} as const;

export type Token = { text: string; color: string; fontStyle: number };

export type Line = {
  // Runs of text with the same color and font style
  tokens: Token[];
  // The grammar's tokens with their full scope stacks
  scopes: { text: string; scopes: string[] }[];
};

// VS Code's built-in extensions folder in the usual install locations
export const findExtensionsDir = (): string | undefined => {
  const { HOME, LOCALAPPDATA, ProgramFiles } = process.env;
  const app = "resources/app/extensions";
  const candidates = process.platform === "darwin"
    ? [
      "/Applications/Visual Studio Code.app",
      `${HOME}/Applications/Visual Studio Code.app`,
      "/Applications/Visual Studio Code - Insiders.app",
    ].map((dir) => `${dir}/Contents/Resources/app/extensions`)
    : process.platform === "win32"
    ? [
      `${LOCALAPPDATA}/Programs/Microsoft VS Code/${app}`,
      `${ProgramFiles}/Microsoft VS Code/${app}`,
    ]
    : [
      `/usr/share/code/${app}`,
      `/opt/visual-studio-code/${app}`,
      `/snap/code/current/usr/share/code/${app}`,
    ];
  return candidates.find((dir) => existsSync(dir));
};

let wasmLoaded: Promise<void> | undefined;
const loadWasm = () => {
  const require = createRequire(import.meta.url);
  wasmLoaded ??= oniguruma.loadWASM(
    readFileSync(require.resolve("vscode-oniguruma/release/onig.wasm")),
  );
  return wasmLoaded;
};

export const createHighlighter = async (extensionsDir: string) => {
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

  await loadWasm();
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

  // The lines of `file` colored with `theme`, or undefined if VS Code has no
  // grammar for it.
  const highlight = async (file: string, theme: Theme) => {
    const scopeName = scopeForFile(file);
    const grammar = scopeName && await registry.loadGrammar(scopeName);
    if (!scopeName || !grammar) return undefined;

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

    const lines: Line[] = [];
    let ruleStack = vsctm.INITIAL;
    const text = readFileSync(file, "utf8").replace(/\n$/, "");
    for (const line of text.split("\n")) {
      const { tokens: encoded, ruleStack: next } = grammar.tokenizeLine2(
        line,
        ruleStack,
      );
      const tokens: Token[] = [];
      for (let i = 0; i < encoded.length; i += 2) {
        const end = i + 2 < encoded.length ? encoded[i + 2] : line.length;
        const metadata = encoded[i + 1];
        tokens.push({
          text: line.slice(encoded[i], end),
          // Bit layout of vscode-textmate's encoded token metadata
          color: colorMap[(metadata & 0x00ff8000) >>> 15],
          fontStyle: (metadata & 0x00007800) >>> 11,
        });
      }
      const scopes = grammar.tokenizeLine(line, ruleStack).tokens.map((
        token,
      ) => ({
        text: line.slice(token.startIndex, token.endIndex),
        scopes: token.scopes,
      }));
      lines.push({ tokens, scopes });
      ruleStack = next;
    }
    return { scopeName, lines };
  };

  return { highlight };
};
