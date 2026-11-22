import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { isMeanNumerator } from '../utils/is-mean-numerator.js';
import { isSumReducer, sumReduce } from '../utils/sum-reducer.js';

export const preferMean = createRule({
  name: 'prefer-mean',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `mean` from es-toolkit instead of dividing a `reduce` sum by `.length`.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferMean:
        'Prefer `mean` from es-toolkit instead of dividing a `reduce` sum by `length`.',
    },
  },
  create(context, [options]) {
    // Matches the `prefer-sum` reduce and reports the `xs.reduce(…) / xs.length` around it;
    // chain position is measured on the `reduce`.
    return {
      [sumReduce](node: TSESTree.CallExpression) {
        if (
          isSumReducer(node)
          && isMeanNumerator(node, context.sourceCode)
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node: node.parent, messageId: 'preferMean' });
      },
    };
  },
});
