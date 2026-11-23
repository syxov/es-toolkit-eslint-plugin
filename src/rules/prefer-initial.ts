import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isNonArraySlice } from '../utils/non-array-receiver.js';
import { stringContext } from '../utils/selectors.js';

// `raw` rather than `value`: esquery compares values as strings, so `slice('0', -1)` would match too.
const initialSlice = `CallExpression[callee.property.name="slice"][arguments.length=2][arguments.0.type="Literal"][arguments.0.raw="0"][arguments.1.type="UnaryExpression"][arguments.1.operator="-"][arguments.1.argument.type="Literal"][arguments.1.argument.raw="1"]:not(${stringContext})`;

export const preferInitial = createRule({
  name: 'prefer-initial',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `initial` from es-toolkit instead of `arr.slice(0, -1)`.',
    },
    schema: [],
    messages: {
      preferInitial:
        'Prefer `initial` from es-toolkit instead of `arr.slice(0, -1)`.',
    },
  },
  create(context) {
    return {
      [initialSlice](node: TSESTree.CallExpression) {
        if (!isNonArraySlice(context.sourceCode, node))
          context.report({ node, messageId: 'preferInitial' });
      },
    };
  },
});
