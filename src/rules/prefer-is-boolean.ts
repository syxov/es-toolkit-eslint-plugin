import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest, typeofComparison } from '../utils/type-test.js';

export const preferIsBoolean = createRule({
  name: 'prefer-is-boolean',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isBoolean` from es-toolkit instead of a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsBoolean:
        'Prefer `isBoolean` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison('boolean')](node: TSESTree.BinaryExpression) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isBoolean'))
          context.report({ node, messageId: 'preferIsBoolean' });
      },
    };
  },
});
