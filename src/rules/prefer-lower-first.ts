import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  casedFirstChar,
  halvesOf,
  joinedHalves,
  restFrom,
  type JoinedHalves,
} from '../utils/string-case.js';

export const preferLowerFirst = createRule({
  name: 'prefer-lower-first',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `lowerFirst` from es-toolkit instead of lower-casing the first character by hand.',
    },
    schema: [],
    messages: {
      preferLowerFirst:
        'Prefer `lowerFirst` from es-toolkit instead of lower-casing the first character by hand.',
    },
  },
  create(context) {
    return {
      [joinedHalves](node: JoinedHalves) {
        const [left, right] = halvesOf(node);
        const first = casedFirstChar(left, 'toLowerCase');
        const rest = restFrom(right);
        if (first && rest && isSameExpression(context.sourceCode, first, rest))
          context.report({ node, messageId: 'preferLowerFirst' });
      },
    };
  },
});
