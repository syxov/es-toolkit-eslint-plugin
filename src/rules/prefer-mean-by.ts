import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { isMeanNumerator } from '../utils/is-mean-numerator.js';
import { isSumByReducer, sumByReduce } from '../utils/sum-reducer.js';

export const preferMeanBy = createRule({
  name: 'prefer-mean-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `meanBy` from es-toolkit instead of dividing a property-summing reduce by length.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferMeanBy:
        'Prefer `meanBy` from es-toolkit instead of averaging a property with `reduce`.',
    },
  },
  create(context, [options]) {
    // Matches the `prefer-sum-by` reduce and reports the `xs.reduce(…) / xs.length` around it;
    // chain position is measured on the `reduce`.
    return {
      [sumByReduce](node: TSESTree.CallExpression) {
        if (
          isSumByReducer(node)
          && isMeanNumerator(node, context.sourceCode)
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node: node.parent, messageId: 'preferMeanBy' });
      },
    };
  },
});
