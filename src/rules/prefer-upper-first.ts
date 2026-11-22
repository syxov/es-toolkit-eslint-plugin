import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  casedFirstChar,
  halvesOf,
  joinedHalves,
  restFrom,
  type JoinedHalves,
} from '../utils/string-case.js';

export const preferUpperFirst = createRule({
  name: 'prefer-upper-first',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `upperFirst` from es-toolkit instead of `s.charAt(0).toUpperCase() + s.slice(1)`.',
    },
    schema: [],
    messages: {
      preferUpperFirst:
        'Prefer `upperFirst` from es-toolkit instead of upper-casing the first character by hand.',
    },
  },
  create(context) {
    return {
      [joinedHalves](node: JoinedHalves) {
        const [left, right] = halvesOf(node);
        const first = casedFirstChar(left, 'toUpperCase');
        const rest = restFrom(right);
        if (first && rest && isSameExpression(context.sourceCode, first, rest))
          context.report({ node, messageId: 'preferUpperFirst' });
      },
    };
  },
});
