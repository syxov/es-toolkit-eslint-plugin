import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsFile = createRule({
  name: 'prefer-is-file',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `isFile` over `value instanceof File`.' },
    schema: [],
    messages: {
      preferIsFile:
        'Prefer `isFile` from es-toolkit instead of `value instanceof File`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="File"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsFile' }),
    };
  },
});
