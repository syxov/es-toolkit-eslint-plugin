import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferFlattenDeep = createRule({
  name: 'prefer-flatten-deep',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `flattenDeep` over `arr.flat(Infinity)`.' },
    schema: [],
    messages: {
      preferFlattenDeep:
        'Prefer `flattenDeep` from es-toolkit instead of `arr.flat(Infinity)`.',
    },
  },
  create(context) {
    return {
      'CallExpression[callee.property.name="flat"][arguments.length=1][arguments.0.name="Infinity"]':
        (node: TSESTree.Node) =>
          context.report({ node, messageId: 'preferFlattenDeep' }),
    };
  },
});
