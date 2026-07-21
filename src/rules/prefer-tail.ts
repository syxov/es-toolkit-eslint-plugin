import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferTail = createRule({
  name: 'prefer-tail',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `tail` from es-toolkit over `arr.slice(1)`.' },
    schema: [],
    messages: {
      preferTail: 'Prefer `tail` from es-toolkit instead of `arr.slice(1)`.',
    },
  },
  create(context) {
    return {
      'CallExpression[callee.property.name="slice"][arguments.length=1][arguments.0.value=1]':
        (node: TSESTree.Node) =>
          context.report({ node, messageId: 'preferTail' }),
    };
  },
});
