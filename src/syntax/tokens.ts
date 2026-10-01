// Minimal syntax highlighting, following Alabaster
// (https://github.com/tonsky/vscode-theme-alabaster) and
// https://tonsky.me/blog/syntax-highlighting/
//
// Only strings, constants, comments and definitions get a color. Grammars use
// `entity.name` for both definitions and uses of a name, so most rules below
// put uses (calls, type references, tags, ...) back to the plain text color.
//
// VS Code picks the rule matching the most specific scope, so rule order here
// only matters for readability.
import type { SyntaxRoles } from "../types.ts";

type TokenColor = {
  name: string;
  scope: string[];
  settings: { foreground?: string; fontStyle?: string };
};

const rule = (
  name: string,
  foreground: string,
  scope: string[],
): TokenColor => ({ name, scope, settings: { foreground } });

const fontStyle = (
  name: string,
  style: string,
  scope: string[],
): TokenColor => ({ name, scope, settings: { fontStyle: style } });

export const getTokenColors = (roles: SyntaxRoles): TokenColor[] => {
  const comments = rule("Comments", roles.comment, [
    "comment",
    "punctuation.definition.comment",
  ]);

  const rules = [
    rule("Strings", roles.string, [
      "string",
      "constant.other.symbol",
      "punctuation.definition.string",
      "entity.name.import.go",
      // Character classes like \d
      "string.regexp constant",
    ]),
    rule("Code inside strings", roles.text, [
      "meta.template.expression",
      "meta.embedded",
      "meta.interpolation",
      "meta.parameter-expansion",
      "string variable",
    ]),
    rule("Constants", roles.constant, [
      "constant",
      "punctuation.definition.constant",
      // The & and ; in HTML entities like &amp;
      "constant.character.entity punctuation",
    ]),
    rule("Named constants are not literals", roles.text, [
      "constant.other.caps",
      "constant.other.enum",
      "constant.other.option",
    ]),
    rule("Definitions", roles.definition, [
      "entity.name",
      "entity.name.type.class",
      "entity.name.type.interface",
      "entity.name.type.alias",
      "entity.name.type.enum",
      "entity.name.type.struct",
      "entity.name.type.trait",
      "entity.name.type.module",
      // Python's def __init__ and friends
      "meta.function.python support.function.magic",
    ]),
    rule("Uses of names", roles.text, [
      "meta.function-call entity.name.function",
      "meta.method-call entity.name.function",
      "meta.function.call entity.name.function",
      "entity.name.function.support",
      "entity.name.function.call",
      "entity.name.function.decorator",
      "entity.name.function.macro",
      "entity.name.command",
      "entity.name.type",
      "entity.name.namespace",
      "entity.name.type.namespace",
      "entity.name.variable",
      "entity.name.tag",
      "support.type.property-name",
      "string.unquoted.argument.shell",
    ]),
    rule("Punctuation", roles.punctuation, [
      "punctuation",
      "constant.character.escape",
      "constant.other.placeholder",
      "constant.character.format.placeholder",
    ]),
    rule("Invalid", roles.invalid, ["invalid"]),
    rule("Diff: range", roles.definition, ["meta.diff.range"]),
    rule("Diff: inserted", roles.inserted, ["markup.inserted"]),
    rule("Diff: deleted", roles.deleted, ["markup.deleted"]),
    rule("Diff: changed", roles.changed, ["markup.changed"]),
  ];

  // Keep comments one color, e.g. type names and tags in doc comments.
  const insideComments = rule(
    "Inside comments",
    roles.comment,
    rules.flatMap(({ scope }) => scope.map((s) => `comment ${s}`)),
  );

  return [
    comments,
    ...rules,
    insideComments,
    fontStyle("Markup: bold", "bold", ["markup.bold", "strong"]),
    fontStyle("Markup: italic", "italic", ["markup.italic", "emphasis"]),
    fontStyle("Markup: strikethrough", "strikethrough", [
      "markup.strikethrough",
    ]),
  ];
};
