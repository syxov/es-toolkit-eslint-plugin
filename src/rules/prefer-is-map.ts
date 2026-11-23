import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isReplaceableTypeTest } from '../utils/type-test.js';

export const preferIsMap = createRule({
  name: 'prefer-is-map',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isMap` from es-toolkit instead of `value instanceof Map`.',
    },
    schema: [],
    messages: {
      preferIsMap:
        'Prefer `isMap` from es-toolkit instead of `value instanceof Map`.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="instanceof"][right.type="Identifier"][right.name="Map"]'(
        node: TSESTree.BinaryExpression,
      ) {
        if (isReplaceableTypeTest(context.sourceCode, node, 'isMap'))
          context.report({ node, messageId: 'preferIsMap' });
      },
    };
  },
});
