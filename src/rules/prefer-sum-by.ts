import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { isMeanNumerator } from '../utils/is-mean-numerator.js';

const reduce =
  'CallExpression[callee.property.name="reduce"][arguments.length=2][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=2][arguments.1.value=0]';
export const preferSumBy = createRule({
  name: 'prefer-sum-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `sumBy` from es-toolkit instead of a property-summing reduce.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferSumBy:
        'Prefer `sumBy` from es-toolkit instead of summing a property with `reduce`.',
    },
  },
  create(context, [options]) {
    return {
      [reduce](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (
          arrow.type !== 'ArrowFunctionExpression'
          || arrow.body.type !== 'BinaryExpression'
          || arrow.body.operator !== '+'
        )
          return;
        const [acc, item] = arrow.params;
        if (acc.type !== 'Identifier' || item.type !== 'Identifier') return;
        const { left, right } = arrow.body;
        const property =
          left.type === 'MemberExpression'
          && left.object.type === 'Identifier'
          && left.object.name === item.name
          && right.type === 'Identifier'
          && right.name === acc.name
            ? left
            : right.type === 'MemberExpression'
                && right.object.type === 'Identifier'
                && right.object.name === item.name
                && left.type === 'Identifier'
                && left.name === acc.name
              ? right
              : null;
        if (
          !property
          || isMeanNumerator(node)
          || !shouldReportArrayMethodReplacement(
            node,
            options,
            context.settings,
          )
        )
          return;
        context.report({ node, messageId: 'preferSumBy' });
      },
    };
  },
});
