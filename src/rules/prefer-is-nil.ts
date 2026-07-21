import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const nilComparison = (value: 'left' | 'right') =>
  `BinaryExpression[operator="=="][${value}.value=null]`;

export const preferIsNil = createRule({
  name: 'prefer-is-nil',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isNil` from es-toolkit over `value == null`.',
    },
    schema: [],
    messages: {
      preferIsNil: 'Prefer `isNil` from es-toolkit instead of `value == null`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsNil' });

    return {
      [nilComparison('left')]: report,
      [nilComparison('right')]: report,
    };
  },
});
