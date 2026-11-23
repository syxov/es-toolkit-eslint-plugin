import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  isReplaceableNilComparison,
  nilPairIn,
  nullLiteral,
  undefinedValue,
} from '../utils/nil-check.js';

const looseNilComparison = `BinaryExpression[operator="=="]:matches(${nullLiteral('left')}, ${nullLiteral('right')}, ${undefinedValue('left')}, ${undefinedValue('right')})`;

export const preferIsNil = createRule({
  name: 'prefer-is-nil',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isNil` from es-toolkit instead of `value == null` or `value === null || value === undefined`.',
    },
    schema: [],
    messages: {
      preferIsNil:
        'Prefer `isNil` from es-toolkit instead of checking for `null` and `undefined` by hand.',
    },
  },
  create(context) {
    return {
      [looseNilComparison](node: TSESTree.BinaryExpression) {
        if (isReplaceableNilComparison(context.sourceCode, node, 'isNil'))
          context.report({ node, messageId: 'preferIsNil' });
      },
      'LogicalExpression[operator="||"]'(node: TSESTree.LogicalExpression) {
        const loc = nilPairIn(context.sourceCode, node, 'isNil');
        if (loc) context.report({ loc, messageId: 'preferIsNil' });
      },
    };
  },
});
