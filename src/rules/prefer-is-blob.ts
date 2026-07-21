import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsBlob = createRule({
  name: 'prefer-is-blob',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `isBlob` over `value instanceof Blob`.' },
    schema: [],
    messages: {
      preferIsBlob:
        'Prefer `isBlob` from es-toolkit instead of `value instanceof Blob`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="Blob"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsBlob' }),
    };
  },
});
