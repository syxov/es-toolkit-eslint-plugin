import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const stringify = (side: 'left' | 'right') =>
  `[${side}.callee.object.name="JSON"][${side}.callee.property.name="stringify"]`;

// `JSON.stringify(a) === JSON.stringify(b)` (or `!==`) is a fragile deep-equality check.
const stringifyComparison = `BinaryExpression[operator=/^[!=]==?$/]${stringify('left')}${stringify('right')}`;

export const preferIsEqual = createRule({
  name: 'prefer-is-equal',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `isEqual` from es-toolkit over comparing `JSON.stringify` results.',
    },
    schema: [],
    messages: {
      preferIsEqual:
        'Prefer `isEqual` from es-toolkit instead of comparing `JSON.stringify` output.',
    },
  },
  create(context) {
    return {
      [stringifyComparison]: (node: TSESTree.Node) =>
        context.report({ node, messageId: 'preferIsEqual' }),
    };
  },
});
