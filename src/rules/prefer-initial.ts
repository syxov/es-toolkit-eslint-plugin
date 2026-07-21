import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferInitial = createRule({
  name: 'prefer-initial',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `initial` from es-toolkit over `arr.slice(0, -1)`.',
    },
    schema: [],
    messages: {
      preferInitial:
        'Prefer `initial` from es-toolkit instead of `arr.slice(0, -1)`.',
    },
  },
  create(context) {
    return {
      'CallExpression[callee.property.name="slice"][arguments.length=2][arguments.0.value=0][arguments.1.operator="-"][arguments.1.argument.value=1]':
        (node: TSESTree.Node) =>
          context.report({ node, messageId: 'preferInitial' }),
    };
  },
});
