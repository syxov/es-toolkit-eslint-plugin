import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferIsError = createRule({
  name: 'prefer-is-error',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isError` from es-toolkit instead of `value instanceof Error`.',
    },
    schema: [],
    messages: {
      preferIsError:
        'Prefer `isError` from es-toolkit instead of `value instanceof Error`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="Error"]':
        (node: TSESTree.BinaryExpression) =>
          context.report({ node, messageId: 'preferIsError' }),
    };
  },
});
