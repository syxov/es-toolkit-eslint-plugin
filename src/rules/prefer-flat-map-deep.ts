import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferFlatMapDeep = createRule({
  name: 'prefer-flat-map-deep',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `flatMapDeep` over `arr.map(callback).flat(Infinity)`.',
    },
    schema: [],
    messages: {
      preferFlatMapDeep:
        'Prefer `flatMapDeep` from es-toolkit instead of `arr.map(callback).flat(Infinity)`.',
    },
  },
  create(context) {
    return {
      'CallExpression[callee.property.name="flat"][arguments.length=1][arguments.0.name="Infinity"][callee.object.callee.property.name="map"][callee.object.arguments.length=1]':
        (node: TSESTree.Node) =>
          context.report({ node, messageId: 'preferFlatMapDeep' }),
    };
  },
});
