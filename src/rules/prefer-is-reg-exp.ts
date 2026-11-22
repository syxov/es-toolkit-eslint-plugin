import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferIsRegExp = createRule({
  name: 'prefer-is-reg-exp',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isRegExp` from es-toolkit instead of `value instanceof RegExp`.',
    },
    schema: [],
    messages: {
      preferIsRegExp:
        'Prefer `isRegExp` from es-toolkit instead of `value instanceof RegExp`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="RegExp"]':
        (node: TSESTree.BinaryExpression) =>
          context.report({ node, messageId: 'preferIsRegExp' }),
    };
  },
});
