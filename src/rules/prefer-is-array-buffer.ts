import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferIsArrayBuffer = createRule({
  name: 'prefer-is-array-buffer',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isArrayBuffer` from es-toolkit instead of `value instanceof ArrayBuffer`.',
    },
    schema: [],
    messages: {
      preferIsArrayBuffer:
        'Prefer `isArrayBuffer` from es-toolkit instead of `value instanceof ArrayBuffer`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="ArrayBuffer"]':
        (node: TSESTree.BinaryExpression) =>
          context.report({ node, messageId: 'preferIsArrayBuffer' }),
    };
  },
});
