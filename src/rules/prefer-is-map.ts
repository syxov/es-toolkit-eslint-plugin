import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsMap = createRule({
  name: 'prefer-is-map',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `isMap` over `value instanceof Map`.' },
    schema: [],
    messages: {
      preferIsMap:
        'Prefer `isMap` from es-toolkit instead of `value instanceof Map`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="Map"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsMap' }),
    };
  },
});
