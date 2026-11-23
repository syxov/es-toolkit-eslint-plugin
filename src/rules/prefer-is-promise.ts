import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest } from '../utils/type-test.js';

export const preferIsPromise = createRule({
  name: 'prefer-is-promise',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isPromise` from es-toolkit instead of `value instanceof Promise`.',
    },
    schema: [],
    messages: {
      preferIsPromise:
        'Prefer `isPromise` from es-toolkit instead of `value instanceof Promise`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="Promise"]'(
        node: TSESTree.BinaryExpression,
      ) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isPromise'))
          context.report({ node, messageId: 'preferIsPromise' });
      },
    };
  },
});
