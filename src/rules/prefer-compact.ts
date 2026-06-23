import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const filterBoolean =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.name="Boolean"]';

export const preferCompact = createRule({
  name: 'prefer-compact',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `compact` from es-toolkit over `.filter(Boolean)`.',
    },
    schema: [],
    messages: {
      preferCompact:
        'Prefer `compact` from es-toolkit instead of `.filter(Boolean)`.',
    },
  },
  create(context) {
    return {
      [filterBoolean]: (node: TSESTree.Node) =>
        context.report({ node, messageId: 'preferCompact' }),
    };
  },
});
