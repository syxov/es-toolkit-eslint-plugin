import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofComparison = (side: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${side}.value="string"][${side === 'left' ? 'right' : 'left'}.operator="typeof"]`;

export const preferIsString = createRule({
  name: 'prefer-is-string',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isString` from es-toolkit over a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsString:
        'Prefer `isString` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsString' });
    return {
      [typeofComparison('left')]: report,
      [typeofComparison('right')]: report,
    };
  },
});
