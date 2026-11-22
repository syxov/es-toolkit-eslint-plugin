import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { mapReceiver } from '../utils/selectors.js';

// `flat()` or `flat(1)`. `raw` rather than `value`: esquery would also match `flat('1')`.
const flatOneLevel = `CallExpression[callee.property.name="flat"]:matches([arguments.length=0], [arguments.length=1][arguments.0.type="Literal"][arguments.0.raw="1"]):not(${mapReceiver})`;

export const preferFlatten = createRule({
  name: 'prefer-flatten',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `flatten` from es-toolkit instead of `arr.flat()`.',
    },
    schema: [],
    messages: {
      preferFlatten:
        'Prefer `flatten` from es-toolkit instead of `arr.flat()`.',
    },
  },
  create(context) {
    return {
      [flatOneLevel]: (node: TSESTree.CallExpression) =>
        context.report({ node, messageId: 'preferFlatten' }),
    };
  },
});
