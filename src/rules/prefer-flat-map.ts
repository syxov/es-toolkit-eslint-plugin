import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { mapReceiver } from '../utils/selectors.js';

// `flat()` or `flat(1)`. `raw` rather than `value`: esquery would also match `flat('1')`.
// `[config].map(f).flat()` maps a single value: the honest rewrite drops the array, not `flatMap`.
const mapFlatOneLevel = `CallExpression[callee.property.name="flat"]:matches([arguments.length=0], [arguments.length=1][arguments.0.type="Literal"][arguments.0.raw="1"])${mapReceiver}:not([callee.object.callee.object.type="ArrayExpression"][callee.object.callee.object.elements.length=1])`;

export const preferFlatMap = createRule({
  name: 'prefer-flat-map',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `flatMap` from es-toolkit instead of `arr.map(callback).flat()`.',
    },
    schema: [],
    messages: {
      preferFlatMap:
        'Prefer `flatMap` from es-toolkit instead of `arr.map(callback).flat()`.',
    },
  },
  create(context) {
    return {
      [mapFlatOneLevel]: (node: TSESTree.CallExpression) =>
        context.report({ node, messageId: 'preferFlatMap' }),
    };
  },
});
