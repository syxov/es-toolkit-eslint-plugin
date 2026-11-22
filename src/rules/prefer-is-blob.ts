import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferIsBlob = createRule({
  name: 'prefer-is-blob',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isBlob` from es-toolkit instead of `value instanceof Blob`.',
    },
    schema: [],
    messages: {
      preferIsBlob:
        'Prefer `isBlob` from es-toolkit instead of `value instanceof Blob`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="Blob"]':
        (node: TSESTree.BinaryExpression) =>
          context.report({ node, messageId: 'preferIsBlob' }),
    };
  },
});
