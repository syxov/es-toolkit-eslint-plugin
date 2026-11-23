import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest } from '../utils/type-test.js';

export const preferIsSet = createRule({
  name: 'prefer-is-set',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isSet` from es-toolkit instead of `value instanceof Set`.',
    },
    schema: [],
    messages: {
      preferIsSet:
        'Prefer `isSet` from es-toolkit instead of `value instanceof Set`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="Set"]'(
        node: TSESTree.BinaryExpression,
      ) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isSet'))
          context.report({ node, messageId: 'preferIsSet' });
      },
    };
  },
});
