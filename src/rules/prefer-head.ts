import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferHead = createRule({
  name: 'prefer-head',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `head` from es-toolkit over `arr[0]`.' },
    schema: [],
    messages: {
      preferHead: 'Prefer `head` from es-toolkit instead of indexing with `0`.',
    },
  },
  create(context) {
    return {
      'MemberExpression[computed=true][property.value=0]': (
        node: TSESTree.Node,
      ) => context.report({ node, messageId: 'preferHead' }),
    };
  },
});
