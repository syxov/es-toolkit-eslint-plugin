import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest, typeofComparison } from '../utils/type-test.js';

export const preferIsString = createRule({
  name: 'prefer-is-string',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isString` from es-toolkit instead of a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsString:
        'Prefer `isString` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison('string')](node: TSESTree.BinaryExpression) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isString'))
          context.report({ node, messageId: 'preferIsString' });
      },
    };
  },
});
