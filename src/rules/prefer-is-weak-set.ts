import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsWeakSet = createRule({
  name: 'prefer-is-weak-set',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isWeakSet` over `value instanceof WeakSet`.',
    },
    schema: [],
    messages: {
      preferIsWeakSet:
        'Prefer `isWeakSet` from es-toolkit instead of `value instanceof WeakSet`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="WeakSet"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsWeakSet' }),
    };
  },
});
