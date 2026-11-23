import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isNonArraySlice } from '../utils/non-array-receiver.js';
import { stringContext } from '../utils/selectors.js';

// `raw` rather than `value`: esquery compares values as strings, so `slice('1')` would match too.
const tailSlice = `CallExpression[callee.property.name="slice"][arguments.length=1][arguments.0.type="Literal"][arguments.0.raw="1"]:not(${stringContext})`;

export const preferTail = createRule({
  name: 'prefer-tail',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `tail` from es-toolkit instead of `arr.slice(1)`.',
    },
    schema: [],
    messages: {
      preferTail: 'Prefer `tail` from es-toolkit instead of `arr.slice(1)`.',
    },
  },
  create(context) {
    return {
      [tailSlice](node: TSESTree.CallExpression) {
        if (!isNonArraySlice(context.sourceCode, node))
          context.report({ node, messageId: 'preferTail' });
      },
    };
  },
});
