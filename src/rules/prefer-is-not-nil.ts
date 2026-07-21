import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const notNilComparison = (value: 'left' | 'right') =>
  `BinaryExpression[operator="!="][${value}.value=null]`;

export const preferIsNotNil = createRule({
  name: 'prefer-is-not-nil',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `isNotNil` from es-toolkit over `value != null`.',
    },
    schema: [],
    messages: {
      preferIsNotNil:
        'Prefer `isNotNil` from es-toolkit instead of `value != null`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsNotNil' });

    return {
      [notNilComparison('left')]: report,
      [notNilComparison('right')]: report,
    };
  },
});
