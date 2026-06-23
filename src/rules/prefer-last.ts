import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `arr[arr.length - 1]`: a computed access whose index is `<something>.length - 1`.
const lastIndex =
  'MemberExpression[computed=true][property.operator="-"][property.right.value=1][property.left.property.name="length"]';

export const preferLast = createRule({
  name: 'prefer-last',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `last` from es-toolkit over `arr[arr.length - 1]`.',
    },
    schema: [],
    messages: {
      preferLast:
        'Prefer `last` from es-toolkit instead of indexing with `arr.length - 1`.',
    },
  },
  create(context) {
    return {
      [lastIndex]: (node: TSESTree.Node) =>
        context.report({ node, messageId: 'preferLast' }),
    };
  },
});
