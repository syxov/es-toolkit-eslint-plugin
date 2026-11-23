import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';
import { differenceFilterKind } from '../utils/difference-filter.js';
import { filterArrow } from '../utils/selectors.js';

export const preferDifferenceWith = createRule({
  name: 'prefer-difference-with',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `differenceWith` from es-toolkit instead of `a.filter(x => !b.some(y => isEqual(x, y)))`.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferDifferenceWith:
        'Prefer `differenceWith` from es-toolkit instead of filtering out elements that equal one in another array.',
    },
  },
  create(context, [options]) {
    return {
      [filterArrow](node: TSESTree.CallExpression) {
        if (
          differenceFilterKind(context.sourceCode, node) === 'with'
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node, messageId: 'preferDifferenceWith' });
      },
    };
  },
});
