import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsSet = createRule({
  name: 'prefer-is-set',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `isSet` over `value instanceof Set`.' },
    schema: [],
    messages: {
      preferIsSet:
        'Prefer `isSet` from es-toolkit instead of `value instanceof Set`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="Set"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsSet' }),
    };
  },
});
