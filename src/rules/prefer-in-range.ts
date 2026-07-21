import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const isSameExpression = (
  context: Readonly<{ sourceCode: { getText(node: TSESTree.Node): string } }>,
  left: TSESTree.Node,
  right: TSESTree.Node,
) => context.sourceCode.getText(left) === context.sourceCode.getText(right);

export const preferInRange = createRule({
  name: 'prefer-in-range',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `inRange` over a lower- and upper-bound comparison.',
    },
    schema: [],
    messages: {
      preferInRange:
        'Prefer `inRange` from es-toolkit instead of checking both range bounds by hand.',
    },
  },
  create(context) {
    return {
      'LogicalExpression[operator="&&"][left.type="BinaryExpression"][right.type="BinaryExpression"]'(
        node: TSESTree.LogicalExpression,
      ) {
        const lower = node.left as TSESTree.BinaryExpression;
        const upper = node.right as TSESTree.BinaryExpression;
        if (
          lower.operator !== '>='
          || upper.operator !== '<'
          || !isSameExpression(context, lower.left, upper.left)
        )
          return;
        context.report({ node, messageId: 'preferInRange' });
      },
    };
  },
});
