import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// A replacer or indentation argument changes what is compared, so only plain calls count.
const stringify = (side: 'left' | 'right') =>
  `[${side}.type="CallExpression"][${side}.callee.object.name="JSON"][${side}.callee.property.name="stringify"][${side}.arguments.length=1]`;

// `JSON.stringify(a) === JSON.stringify(b)` (or `!==`) is a fragile deep-equality check.
const stringifyComparison = `BinaryExpression[operator=/^[!=]==?$/]${stringify('left')}${stringify('right')}`;

export const preferIsEqual = createRule({
  name: 'prefer-is-equal',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isEqual` from es-toolkit instead of comparing `JSON.stringify` results.',
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
