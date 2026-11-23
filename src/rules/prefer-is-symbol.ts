import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest, typeofComparison } from '../utils/type-test.js';

export const preferIsSymbol = createRule({
  name: 'prefer-is-symbol',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isSymbol` from es-toolkit instead of a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsSymbol:
        'Prefer `isSymbol` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison('symbol')](node: TSESTree.BinaryExpression) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isSymbol'))
          context.report({ node, messageId: 'preferIsSymbol' });
      },
    };
  },
});
