import type { TSESTree } from '@typescript-eslint/utils';
import {
  chainPositions,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
const division =
  'BinaryExpression[operator="/"][left.callee.property.name="reduce"][right.property.name="length"]';
export const preferMeanBy = createRule({
  name: 'prefer-mean-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `meanBy` over dividing a property-summing reduce by length.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          chainPosition: { type: 'string', enum: [...chainPositions] },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferMeanBy:
        'Prefer `meanBy` from es-toolkit instead of averaging a property with `reduce`.',
    },
  },
  defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
  create(context) {
    return {
      [division](node: TSESTree.BinaryExpression) {
        const reduce = node.left;
        const length = node.right;
        if (
          reduce.type !== 'CallExpression'
          || length.type !== 'MemberExpression'
          || reduce.callee.type !== 'MemberExpression'
          || length.object.type !== 'Identifier'
          || reduce.callee.object.type !== 'Identifier'
          || reduce.callee.object.name !== length.object.name
          || reduce.arguments.length !== 2
        )
          return;
        const [arrow, seed] = reduce.arguments;
        if (
          arrow.type !== 'ArrowFunctionExpression'
          || arrow.body.type !== 'BinaryExpression'
          || arrow.body.operator !== '+'
          || seed.type !== 'Literal'
          || seed.value !== 0
        )
          return;
        const [acc, item] = arrow.params;
        if (acc?.type !== 'Identifier' || item?.type !== 'Identifier') return;
        const { left, right } = arrow.body;
        const matches =
          (left.type === 'Identifier'
            && left.name === acc.name
            && right.type === 'MemberExpression'
            && right.object.type === 'Identifier'
            && right.object.name === item.name)
          || (right.type === 'Identifier'
            && right.name === acc.name
            && left.type === 'MemberExpression'
            && left.object.type === 'Identifier'
            && left.object.name === item.name);
        if (
          !matches
          || !shouldReportArrayMethodReplacement(
            reduce,
            context.options,
            context.settings,
          )
        )
          return;
        context.report({ node, messageId: 'preferMeanBy' });
      },
    };
  },
});
