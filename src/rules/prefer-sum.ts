import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { isMeanNumerator } from '../utils/is-mean-numerator.js';
import { sumReduce, isSumReducer } from '../utils/sum-reducer.js';

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
      [sumReduce](node: TSESTree.CallExpression) {
        if (
          isSumReducer(node)
          && !isMeanNumerator(node, context.sourceCode)
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node, messageId: 'preferSum' });
      },
    };
  },
});
