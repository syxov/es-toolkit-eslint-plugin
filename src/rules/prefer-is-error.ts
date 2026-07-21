import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsError = createRule({
  name: 'prefer-is-error',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `isError` over `value instanceof Error`.' },
    schema: [],
    messages: {
      preferIsError:
        'Prefer `isError` from es-toolkit instead of `value instanceof Error`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.name="Error"]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferIsError' }),
    };
  },
});
