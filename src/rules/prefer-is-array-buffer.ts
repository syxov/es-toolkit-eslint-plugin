import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsArrayBuffer = createRule({
  name: 'prefer-is-array-buffer',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `isArrayBuffer` over `value instanceof ArrayBuffer`.',
    },
    schema: [],
    messages: {
      preferIsArrayBuffer:
        'Prefer `isArrayBuffer` from es-toolkit instead of `value instanceof ArrayBuffer`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="ArrayBuffer"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsArrayBuffer' }),
    };
  },
});
