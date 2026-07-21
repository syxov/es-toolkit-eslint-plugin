import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsWeakMap = createRule({
  name: 'prefer-is-weak-map',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isWeakMap` over `value instanceof WeakMap`.',
    },
    schema: [],
    messages: {
      preferIsWeakMap:
        'Prefer `isWeakMap` from es-toolkit instead of `value instanceof WeakMap`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="WeakMap"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsWeakMap' }),
    };
  },
});
