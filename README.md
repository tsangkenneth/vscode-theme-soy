# Soy Themes

VS Code themes with **minimal syntax highlighting** and a **fully colored UI**.

The editor highlights only what helps you read code: strings, constants,
comments and top-level definitions. Keywords, variables and function calls stay
the default text color, and comments are prominent rather than dimmed. The rest
of the workbench (sidebar, tabs, status bar, terminal, git decorations and so
on) uses the full palette.

> **Status:** work in progress. All variants are available; publishing is still
> to come.

## Syntax highlighting

There are only four highlight colors, so you can remember all of them:

| Color      | What                                                          |
| ---------- | ------------------------------------------------------------- |
| Comment    | Comments, in a prominent color: they are worth reading        |
| String     | Strings and regular expressions                               |
| Constant   | Literals: numbers, booleans, `null`, symbols                  |
| Definition | Functions, classes, types and modules where they are declared |

Punctuation and escape sequences are slightly dimmed. Everything else (keywords,
variables, function calls, type references, operators) is the plain text color,
and code never uses bold or italics.

## Variants

- Soy Gruvbox Dark - Medium Contrast
- Soy Gruvbox Dark - Hard Contrast
- Soy Gruvbox Dark - Soft Contrast
- Soy Gruvbox Light - Medium Contrast
- Soy Gruvbox Light - Hard Contrast
- Soy Gruvbox Light - Soft Contrast
- Soy Solarized Light
- Soy Solarized Dark
- Soy Nord

Each variant uses only the colors of its original palette: no blended or
adjusted shades. Where a palette's usual color for something is too faint to
read, the closest palette color with enough contrast is used instead. Body text
aims for a contrast ratio of at least 4.5:1 and highlights at least 3:1;
`scripts/check.ts` reports any color below those targets. The terminal uses each
palette's official ANSI colors.

## Inspiration and credits

- [I am sorry, but everyone is getting syntax highlighting wrong](https://tonsky.me/blog/syntax-highlighting/)
  by Nikita Prokopov ([tonsky](https://github.com/tonsky)) sets out the
  principles for the syntax highlighting.
- [Alabaster](https://github.com/tonsky/vscode-theme-alabaster), also by
  [tonsky](https://github.com/tonsky), is the reference implementation of those
  principles for VS Code.
- [Gruvbox Theme](https://github.com/jdinhify/vscode-theme-gruvbox) by
  [jdinhify](https://github.com/jdinhify) provides the theme generator and the
  UI color mappings this project is built on.

Both projects are MIT licensed; their notices are reproduced in
[LICENSE](LICENSE).

The color palettes are [Gruvbox](https://github.com/morhetz/gruvbox) by Pavel
Pertsev, [Solarized](https://ethanschoonover.com/solarized/) by Ethan Schoonover
and [Nord](https://www.nordtheme.com/) by Sven Greb.

## Development

The generator is plain TypeScript with no dependencies. It runs on Deno, Node
(22.18 or later, which runs `.ts` files directly) or Bun.

```sh
deno task build      # or: node src/main.ts / bun src/main.ts
deno task check      # format, lint, type check and contrast check
```

Node and Bun can run the contrast check directly: `node scripts/check.ts` or
`bun scripts/check.ts`.

`build` writes one JSON file per variant to `themes/` and updates
`contributes.themes` in `package.json` to match `src/variants.ts`. Commit the
generated themes along with the source changes.

To try the themes, open this folder in VS Code and press <kbd>F5</kbd>. This
opens an Extension Development Host window where the Soy themes are available in
**Preferences: Color Theme**. Rebuild and reload that window (**Developer:
Reload Window**) to see changes. The files in `samples/` cover the cases that
matter for the syntax rules, and **Developer: Inspect Editor Tokens and Scopes**
shows which rule colored a token.

### Layout

| Path               | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| `src/main.ts`      | Entry point: writes themes and syncs the manifest |
| `src/variants.ts`  | The list of variants to generate                  |
| `src/palettes/`    | Palette definitions, one file per family          |
| `src/ui/`          | Workbench (non-syntax) color mappings             |
| `src/syntax/`      | Token and semantic token rules for code           |
| `src/types.ts`     | Shared types: palette slots and syntax roles      |
| `scripts/check.ts` | Consistency and contrast checks for every variant |
| `themes/`          | Generated theme files                             |
| `samples/`         | Code samples for checking the syntax rules        |

## License

[MIT](LICENSE)
