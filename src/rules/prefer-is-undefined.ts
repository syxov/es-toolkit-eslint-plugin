import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const undefinedComparison = (value: 'left' | 'right') =>
  `BinaryExpression[operator="==="][${value}.type="Identifier"][${value}.name="undefined"]`;

export const preferIsUndefined = createRule({
  name: 'prefer-is-undefined',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `isUndefined` from es-toolkit over `value === undefined`.',
    },
    schema: [],
    messages: {
      preferIsUndefined:
        'Prefer `isUndefined` from es-toolkit instead of `value === undefined`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsUndefined' });

    return {
      [undefinedComparison('left')]: report,
      [undefinedComparison('right')]: report,
    };
  },
});
