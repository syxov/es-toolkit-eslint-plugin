import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest, typeofComparison } from '../utils/type-test.js';

export const preferIsNumber = createRule({
  name: 'prefer-is-number',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isNumber` from es-toolkit instead of a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsNumber:
        'Prefer `isNumber` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison('number')](node: TSESTree.BinaryExpression) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isNumber'))
          context.report({ node, messageId: 'preferIsNumber' });
      },
    };
  },
});
