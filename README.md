# Soy Themes

VS Code themes with **minimal syntax highlighting** and a **fully colored UI**.

The editor highlights only what helps you read code: strings, constants,
comments and top-level definitions. Keywords, variables and function calls stay
the default text color, and comments are prominent rather than dimmed. The rest
of the workbench (sidebar, tabs, status bar, terminal, git decorations and so
on) uses the full palette.

> **Status:** work in progress. The Gruvbox variants are complete; Solarized and
> Nord are still to come.

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
- Soy Solarized Dark _(planned)_
- Soy Solarized Light _(planned)_
- Soy Nord _(planned)_

## Inspiration and credits

- [I am sorry, but everyone is getting syntax highlighting wrong](https://tonsky.me/blog/syntax-highlighting/)
  by Nikita Prokopov ([tonsky](https://github.com/tonsky)) sets out the principles for the syntax
  highlighting.
- [Alabaster](https://github.com/tonsky/vscode-theme-alabaster), also by [tonsky](https://github.com/tonsky),
  is the reference implementation of those principles for VS Code.
- [Gruvbox Theme](https://github.com/jdinhify/vscode-theme-gruvbox) by [jdinhify](https://github.com/jdinhify)
  provides the theme generator and the UI color mappings this project is built
  on.

Both projects are MIT licensed; their notices are reproduced in
[LICENSE](LICENSE).

## Development

The generator is plain TypeScript with no dependencies. It runs on Deno, Node
(22.18 or later, which runs `.ts` files directly) or Bun.

```sh
deno task build      # or: node src/main.ts / bun src/main.ts
deno task check      # format, lint and type check
```

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

| Path              | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `src/main.ts`     | Entry point: writes themes and syncs the manifest |
| `src/variants.ts` | The list of variants to generate                  |
| `src/palettes/`   | Palette definitions, one file per family          |
| `src/ui/`         | Workbench (non-syntax) color mappings             |
| `src/syntax/`     | Token and semantic token rules for code           |
| `src/types.ts`    | Shared types: palette slots and syntax roles      |
| `themes/`         | Generated theme files                             |
| `samples/`        | Code samples for checking the syntax rules        |

## License

[MIT](LICENSE)
