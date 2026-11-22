import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  isNilPairHalf,
  isWithoutPredicate,
  nullLiteral,
} from '../utils/nil-check.js';

// `== null` also matches `undefined`, so it belongs to prefer-is-nil.
const nullComparison = `BinaryExpression[operator=/^[!=]==$/]:matches(${nullLiteral('left')}, ${nullLiteral('right')})`;

export const preferIsNull = createRule({
  name: 'prefer-is-null',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isNull` from es-toolkit instead of `value === null` or `value !== null`.',
    },
    schema: [],
    messages: {
      preferIsNull:
        'Prefer `isNull` from es-toolkit instead of a strict comparison with `null`.',
    },
  },
  create(context) {
    return {
      [nullComparison](node: TSESTree.BinaryExpression) {
        if (
          !isNilPairHalf(context.sourceCode, node)
          && !isWithoutPredicate(node)
        )
          context.report({ node, messageId: 'preferIsNull' });
      },
    };
  },
});
