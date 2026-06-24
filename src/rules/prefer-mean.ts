import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `<reduce-call> / <…>.length`.
const division =
  'BinaryExpression[operator="/"][left.type="CallExpression"][left.callee.property.name="reduce"][right.type="MemberExpression"][right.property.name="length"]';

const isParam = (node: TSESTree.Node, name: string) =>
  node.type === 'Identifier' && node.name === name;

const addsParams = (body: TSESTree.Node, first: string, second: string) =>
  body.type === 'BinaryExpression'
  && body.operator === '+'
  && ((isParam(body.left, first) && isParam(body.right, second))
    || (isParam(body.left, second) && isParam(body.right, first)));

export const preferMean = createRule({
  name: 'prefer-mean',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `mean` from es-toolkit over dividing a `reduce` sum by `.length`.',
    },
    schema: [],
    messages: {
      preferMean:
        'Prefer `mean` from es-toolkit instead of dividing a `reduce` sum by `length`.',
    },
  },
  create(context) {
    return {
      [division](node: TSESTree.BinaryExpression) {
        const reduce = node.left;
        // The numerator must be the exact `reduce((a, b) => a + b, 0)` sum shape.
        if (reduce.type !== 'CallExpression' || reduce.arguments.length !== 2)
          return;
        const [arrow, seed] = reduce.arguments;
        if (arrow.type !== 'ArrowFunctionExpression') return;
        if (seed.type !== 'Literal' || seed.value !== 0) return;
        const [first, second] = arrow.params;
        if (first?.type !== 'Identifier' || second?.type !== 'Identifier')
          return;
        if (!addsParams(arrow.body, first.name, second.name)) return;

        context.report({ node, messageId: 'preferMean' });
      },
    };
  },
});
