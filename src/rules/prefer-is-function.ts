import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const comparison = (side: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${side}.value="function"][${side === 'left' ? 'right' : 'left'}.operator="typeof"]`;

export const preferIsFunction = createRule({
  name: 'prefer-is-function',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isFunction` over a `typeof` function check.',
    },
    schema: [],
    messages: {
      preferIsFunction:
        'Prefer `isFunction` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsFunction' });
    return { [comparison('left')]: report, [comparison('right')]: report };
  },
});
