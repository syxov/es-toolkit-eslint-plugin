import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsDate = createRule({
  name: 'prefer-is-date',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `isDate` over `value instanceof Date`.' },
    schema: [],
    messages: {
      preferIsDate:
        'Prefer `isDate` from es-toolkit instead of `value instanceof Date`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="Date"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsDate' }),
    };
  },
});
