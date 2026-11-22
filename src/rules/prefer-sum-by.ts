import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { isMeanNumerator } from '../utils/is-mean-numerator.js';
import { sumByReduce, isSumByReducer } from '../utils/sum-reducer.js';

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
      [sumByReduce](node: TSESTree.CallExpression) {
        if (
          isSumByReducer(node)
          && !isMeanNumerator(node, context.sourceCode)
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node, messageId: 'preferSumBy' });
      },
    };
  },
});
