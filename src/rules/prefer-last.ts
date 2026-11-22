import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression, isWriteTarget } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

type LastIndexAccess = TSESTree.MemberExpression & {
  property: TSESTree.BinaryExpression & { left: TSESTree.MemberExpression };
};

// `arr[arr.length - 1]`: a computed access whose index is `<something>.length - 1`.
const lastIndex =
  'MemberExpression[computed=true][property.type="BinaryExpression"][property.operator="-"][property.right.raw="1"][property.left.type="MemberExpression"][property.left.computed=false][property.left.property.name="length"]';

export const preferLast = createRule({
  name: 'prefer-last',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `last` from es-toolkit instead of `arr[arr.length - 1]`.',
    },
    schema: [],
    messages: {
      preferLast:
        'Prefer `last` from es-toolkit instead of indexing with `arr.length - 1`.',
    },
  },
  create(context) {
    return {
      [lastIndex](node: LastIndexAccess) {
        if (
          !isWriteTarget(node)
          && isSameExpression(
            context.sourceCode,
            node.object,
            node.property.left.object,
          )
        )
          context.report({ node, messageId: 'preferLast' });
      },
    };
  },
});
