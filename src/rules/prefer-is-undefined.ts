import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  isNilPairHalf,
  isWithoutPredicate,
  typeofUndefined,
  undefinedValue,
} from '../utils/nil-check.js';

// `== undefined` also matches `null`, so it belongs to prefer-is-nil.
const undefinedComparison = `BinaryExpression[operator=/^[!=]==$/]:matches(${undefinedValue('left')}, ${undefinedValue('right')})`;

export const preferIsUndefined = createRule({
  name: 'prefer-is-undefined',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isUndefined` from es-toolkit instead of `value === undefined`, `value === void 0` or `typeof value === "undefined"`.',
    },
    schema: [],
    messages: {
      preferIsUndefined:
        'Prefer `isUndefined` from es-toolkit instead of comparing with `undefined` by hand.',
    },
  },
  create(context) {
    const report = (node: TSESTree.BinaryExpression) => {
      if (!isNilPairHalf(context.sourceCode, node) && !isWithoutPredicate(node))
        context.report({ node, messageId: 'preferIsUndefined' });
    };
    return {
      [undefinedComparison]: report,
      [typeofUndefined]: report,
    };
  },
});
