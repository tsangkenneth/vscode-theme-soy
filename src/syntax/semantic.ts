// Language servers tag every function, class and type name, and VS Code maps
// those tags onto `entity.name.*` scopes, which would color every call and
// type reference. Give names the text color, and only declarations the
// definition color.
// https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
import type { SyntaxRoles } from "../types.ts";

const namedTypes = [
  "namespace",
  "class",
  "enum",
  "interface",
  "struct",
  "type",
  "typeParameter",
  "function",
  "method",
  "macro",
  "decorator",
];

const definedTypes = [
  "namespace",
  "class",
  "enum",
  "interface",
  "struct",
  "type",
  "function",
  "method",
  "macro",
];

export const getSemanticTokenColors = (
  roles: SyntaxRoles,
): Record<string, string> => ({
  ...Object.fromEntries(namedTypes.map((type) => [type, roles.text])),
  ...Object.fromEntries(
    definedTypes.flatMap((type) => [
      [`${type}.declaration`, roles.definition],
      [`${type}.definition`, roles.definition],
    ]),
  ),
});
