import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferFlatten = createRule({
  name: 'prefer-flatten',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `flatten` over `arr.flat()`.' },
    schema: [],
    messages: {
      preferFlatten:
        'Prefer `flatten` from es-toolkit instead of `arr.flat()`.',
    },
  },
  create(context) {
    return {
      'CallExpression[callee.property.name="flat"][arguments.length=0]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferFlatten' }),
    };
  },
});
