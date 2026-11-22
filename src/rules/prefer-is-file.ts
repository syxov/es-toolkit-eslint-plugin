import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferIsFile = createRule({
  name: 'prefer-is-file',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isFile` from es-toolkit instead of `value instanceof File`.',
    },
    schema: [],
    messages: {
      preferIsFile:
        'Prefer `isFile` from es-toolkit instead of `value instanceof File`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="File"]':
        (node: TSESTree.BinaryExpression) =>
          context.report({ node, messageId: 'preferIsFile' }),
    };
  },
});
