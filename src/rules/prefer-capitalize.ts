import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  casedFirstChar,
  casedRest,
  halvesOf,
  joinedHalves,
  type JoinedHalves,
} from '../utils/string-case.js';

export const preferCapitalize = createRule({
  name: 'prefer-capitalize',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `capitalize` from es-toolkit instead of `s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()`.',
    },
    schema: [],
    messages: {
      preferCapitalize:
        'Prefer `capitalize` from es-toolkit instead of capitalizing by hand.',
    },
  },
  create(context) {
    return {
      [joinedHalves](node: JoinedHalves) {
        const [left, right] = halvesOf(node);
        const first = casedFirstChar(left, 'toUpperCase');
        const rest = casedRest(right, 'toLowerCase');
        if (first && rest && isSameExpression(context.sourceCode, first, rest))
          context.report({ node, messageId: 'preferCapitalize' });
      },
    };
  },
});
