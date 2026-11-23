import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// es-toolkit's `escapeRegExp` escapes exactly these. It leaves `-` alone, so a class that also
// escapes `-` gives a different result (and `\-` is a syntax error under the `u` flag).
const SPECIALS = '.*+?^${}()|[]\\';
// An escaped `/` only escapes the literal delimiter: `\/` and `/` match the same.
const CLASS_MEMBERS = new Set(`${SPECIALS}/`);

// `.replace(/[…]/g, …)` with exactly two arguments, the first a global regex literal whose
// pattern looks like one non-negated, unquantified character class.
const escapeCall = String.raw`CallExpression[callee.property.name=/^replace(All)?$/][arguments.length=2][arguments.0.regex.flags=/g/][arguments.0.regex.pattern=/^\[[^^].*\]$/]`;

// The replacement `\$&` prefixes each match with a backslash.
const escapedMatch = String.raw`/^\\\$&$/`;
const stringReplacement = `[arguments.1.type="Literal"][arguments.1.value=${escapedMatch}]`;
const templateReplacement = `[arguments.1.type="TemplateLiteral"][arguments.1.expressions.length=0][arguments.1.quasis.0.value.cooked=${escapedMatch}]`;

// The pattern is a single class made only of regex specials (plus `/`, escaped or not)
// that lists every special. The class must close on the last character, so `[…]+` or
// `[a][b]` do not qualify.
const isEscapeAllClass = (pattern: string) => {
  const members = new Set<string>();
  for (let index = 1; index < pattern.length; index++) {
    let char = pattern.charAt(index);
    if (char === ']') {
      if (index !== pattern.length - 1) return false;
      return Array.from(SPECIALS).every(special => members.has(special));
    }
    if (char === '\\') {
      index++;
      char = pattern.charAt(index);
    }
    if (!CLASS_MEMBERS.has(char)) return false;
    members.add(char);
  }
  return false;
};

export const preferEscapeRegExp = createRule({
  name: 'prefer-escape-reg-exp',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `escapeRegExp` from es-toolkit instead of escaping regex specials with `.replace`.',
    },
    schema: [],
    messages: {
      preferEscapeRegExp:
        'Prefer `escapeRegExp` from es-toolkit instead of escaping regex specials with `.replace`.',
    },
  },
  create(context) {
    // The selector only matches regex literals as the first argument.
    const report = (node: TSESTree.CallExpression) => {
      const regex = node.arguments[0] as TSESTree.RegExpLiteral;
      if (isEscapeAllClass(regex.regex.pattern)) {
        context.report({ node, messageId: 'preferEscapeRegExp' });
      }
    };

    return {
      [`${escapeCall}${stringReplacement}`]: report,
      [`${escapeCall}${templateReplacement}`]: report,
    };
  },
});
