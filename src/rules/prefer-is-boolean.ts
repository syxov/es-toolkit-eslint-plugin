import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofComparison = (side: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${side}.value="boolean"][${side === 'left' ? 'right' : 'left'}.operator="typeof"]`;

export const preferIsBoolean = createRule({
  name: 'prefer-is-boolean',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isBoolean` from es-toolkit over a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsBoolean:
        'Prefer `isBoolean` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsBoolean' });
    return {
      [typeofComparison('left')]: report,
      [typeofComparison('right')]: report,
    };
  },
});
