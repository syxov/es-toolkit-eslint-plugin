import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { arraySliceCall } from '../utils/selectors.js';

// `raw` rather than `value`: esquery compares values as strings, so `slice('0', n)` would match too.
// A negative end (`slice(0, -n)`) drops from the end; `slice(0, -1)` belongs to prefer-initial.
const takeSlice = arraySliceCall(
  '[arguments.length=2][arguments.0.type="Literal"][arguments.0.raw="0"]:not([arguments.1.type="UnaryExpression"][arguments.1.operator="-"])',
);

export const preferTake = createRule({
  name: 'prefer-take',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `take` from es-toolkit instead of `arr.slice(0, n)`.',
    },
    schema: [],
    messages: {
      preferTake: 'Prefer `take` from es-toolkit instead of `arr.slice(0, n)`.',
    },
  },
  create(context) {
    return {
      [takeSlice]: (node: TSESTree.CallExpression) =>
        context.report({ node, messageId: 'preferTake' }),
    };
  },
});
