import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { isMeanNumerator } from '../utils/is-mean-numerator.js';

// `arr.reduce((a, b) => …, 0)`: a two-arg reduce with a two-param arrow and a `0` seed.
const reduceArrow =
  'CallExpression[callee.property.name="reduce"][arguments.length=2][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=2][arguments.1.value=0]';

const isParam = (node: TSESTree.Node, name: string) =>
  node.type === 'Identifier' && node.name === name;

// `a + b`, where `a` and `b` are exactly the reducer's two params (in either order).
const addsParams = (body: TSESTree.Node, first: string, second: string) =>
  body.type === 'BinaryExpression'
  && body.operator === '+'
  && ((isParam(body.left, first) && isParam(body.right, second))
    || (isParam(body.left, second) && isParam(body.right, first)));

export const preferSum = createRule({
  name: 'prefer-sum',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `sum` from es-toolkit instead of `reduce((a, b) => a + b, 0)`.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferSum:
        'Prefer `sum` from es-toolkit instead of summing with `reduce`.',
    },
  },
  create(context, [options]) {
    return {
      [reduceArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [first, second] = arrow.params;
        if (first.type !== 'Identifier' || second.type !== 'Identifier') return;
        if (!addsParams(arrow.body, first.name, second.name)) return;
        if (isMeanNumerator(node)) return;

        if (shouldReportArrayMethodReplacement(node, options, context.settings))
          context.report({ node, messageId: 'preferSum' });
      },
    };
  },
});
