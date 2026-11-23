import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { differenceFilterKind } from '../utils/difference-filter.js';
import { filterArrow } from '../utils/selectors.js';

export const preferDifferenceBy = createRule({
  name: 'prefer-difference-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `differenceBy` from es-toolkit instead of `a.filter(x => !b.some(y => f(y) === f(x)))`.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferDifferenceBy:
        'Prefer `differenceBy` from es-toolkit instead of filtering out elements whose mapped value occurs in another array.',
    },
  },
  create(context, [options]) {
    return {
      [filterArrow](node: TSESTree.CallExpression) {
        if (
          differenceFilterKind(context.sourceCode, node) === 'by'
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node, messageId: 'preferDifferenceBy' });
      },
    };
  },
});
