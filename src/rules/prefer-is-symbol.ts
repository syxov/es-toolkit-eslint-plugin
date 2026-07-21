import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofComparison = (side: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${side}.value="symbol"][${side === 'left' ? 'right' : 'left'}.operator="typeof"]`;

export const preferIsSymbol = createRule({
  name: 'prefer-is-symbol',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isSymbol` from es-toolkit over a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsSymbol:
        'Prefer `isSymbol` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsSymbol' });
    return {
      [typeofComparison('left')]: report,
      [typeofComparison('right')]: report,
    };
  },
});
