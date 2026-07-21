import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const nullComparison = (value: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${value}.value=null]`;

export const preferIsNull = createRule({
  name: 'prefer-is-null',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isNull` from es-toolkit over `value === null`.',
    },
    schema: [],
    messages: {
      preferIsNull:
        'Prefer `isNull` from es-toolkit instead of `value === null`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsNull' });

    return {
      [nullComparison('left')]: report,
      [nullComparison('right')]: report,
    };
  },
});
