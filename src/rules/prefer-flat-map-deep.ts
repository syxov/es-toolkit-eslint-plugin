import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { mapReceiver } from '../utils/selectors.js';

const mapFlatInfinity = `CallExpression[callee.property.name="flat"][arguments.length=1][arguments.0.type="Identifier"][arguments.0.name="Infinity"]${mapReceiver}`;

export const preferFlatMapDeep = createRule({
  name: 'prefer-flat-map-deep',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `flatMapDeep` from es-toolkit instead of `arr.map(callback).flat(Infinity)`.',
    },
    schema: [],
    messages: {
      preferFlatMapDeep:
        'Prefer `flatMapDeep` from es-toolkit instead of `arr.map(callback).flat(Infinity)`.',
    },
  },
  create(context) {
    return {
      [mapFlatInfinity]: (node: TSESTree.CallExpression) =>
        context.report({ node, messageId: 'preferFlatMapDeep' }),
    };
  },
});
