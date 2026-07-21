import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofComparison = (side: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${side}.value="number"][${side === 'left' ? 'right' : 'left'}.operator="typeof"]`;

export const preferIsNumber = createRule({
  name: 'prefer-is-number',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isNumber` from es-toolkit over a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsNumber:
        'Prefer `isNumber` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsNumber' });
    return {
      [typeofComparison('left')]: report,
      [typeofComparison('right')]: report,
    };
  },
});
