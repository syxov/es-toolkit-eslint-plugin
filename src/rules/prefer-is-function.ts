import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest, typeofComparison } from '../utils/type-test.js';

export const preferIsFunction = createRule({
  name: 'prefer-is-function',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isFunction` from es-toolkit instead of a `typeof` function check.',
    },
    schema: [],
    messages: {
      preferIsFunction:
        'Prefer `isFunction` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison('function')](node: TSESTree.BinaryExpression) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isFunction'))
          context.report({ node, messageId: 'preferIsFunction' });
      },
    };
  },
});
