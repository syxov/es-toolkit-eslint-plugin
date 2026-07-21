import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

export const preferFlatMap = createRule({
  name: 'prefer-flat-map',
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer `flatMap` over `arr.map(callback).flat()`.' },
    schema: [],
    messages: {
      preferFlatMap:
        'Prefer `flatMap` from es-toolkit instead of `arr.map(callback).flat()`.',
    },
  },
  create(context) {
    return {
      'CallExpression[callee.property.name="flat"][arguments.length=0][callee.object.callee.property.name="map"][callee.object.arguments.length=1]':
        (node: TSESTree.Node) =>
          context.report({ node, messageId: 'preferFlatMap' }),
    };
  },
});
