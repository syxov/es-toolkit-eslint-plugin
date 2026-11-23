import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  isReplaceableNilComparison,
  nilPairIn,
  nullLiteral,
  undefinedValue,
} from '../utils/nil-check.js';

const looseNotNilComparison = `BinaryExpression[operator="!="]:matches(${nullLiteral('left')}, ${nullLiteral('right')}, ${undefinedValue('left')}, ${undefinedValue('right')})`;

export const preferIsNotNil = createRule({
  name: 'prefer-is-not-nil',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isNotNil` from es-toolkit instead of `value != null` or `value !== null && value !== undefined`.',
    },
    schema: [],
    messages: {
      preferIsNotNil:
        'Prefer `isNotNil` from es-toolkit instead of checking for `null` and `undefined` by hand.',
    },
  },
  create(context) {
    return {
      [looseNotNilComparison](node: TSESTree.BinaryExpression) {
        if (isReplaceableNilComparison(context.sourceCode, node, 'isNotNil'))
          context.report({ node, messageId: 'preferIsNotNil' });
      },
      'LogicalExpression[operator="&&"]'(node: TSESTree.LogicalExpression) {
        const loc = nilPairIn(context.sourceCode, node, 'isNotNil');
        if (loc) context.report({ loc, messageId: 'preferIsNotNil' });
      },
    };
  },
});
