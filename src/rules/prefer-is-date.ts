import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferIsDate = createRule({
  name: 'prefer-is-date',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isDate` from es-toolkit instead of `value instanceof Date`.',
    },
    schema: [],
    messages: {
      preferIsDate:
        'Prefer `isDate` from es-toolkit instead of `value instanceof Date`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="Date"]':
        (node: TSESTree.BinaryExpression) =>
          context.report({ node, messageId: 'preferIsDate' }),
    };
  },
});
