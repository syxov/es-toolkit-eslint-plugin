import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isNonArraySlice } from '../utils/non-array-receiver.js';
import { arraySliceCall, lastSliceElement } from '../utils/selectors.js';

// A second argument makes it a range (`slice(-n, -1)`), not the last `n` elements.
// `xs.slice(-1)[0]` is the last element: prefer-last owns it.
const takeRightSlice = arraySliceCall(
  `[arguments.length=1][arguments.0.type="UnaryExpression"][arguments.0.operator="-"]:not(${lastSliceElement} > .object)`,
);

export const preferTakeRight = createRule({
  name: 'prefer-take-right',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `takeRight` from es-toolkit instead of `arr.slice(-n)`.',
    },
    schema: [],
    messages: {
      preferTakeRight:
        'Prefer `takeRight` from es-toolkit instead of `arr.slice(-n)`.',
    },
  },
  create(context) {
    return {
      [takeRightSlice](node: TSESTree.CallExpression) {
        if (!isNonArraySlice(context.sourceCode, node))
          context.report({ node, messageId: 'preferTakeRight' });
      },
    };
  },
});
