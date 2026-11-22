import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { mapReceiver } from '../utils/selectors.js';

const flatInfinity = `CallExpression[callee.property.name="flat"][arguments.length=1][arguments.0.type="Identifier"][arguments.0.name="Infinity"]:not(${mapReceiver})`;

export const preferFlattenDeep = createRule({
  name: 'prefer-flatten-deep',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `flattenDeep` from es-toolkit instead of `arr.flat(Infinity)`.',
    },
    schema: [],
    messages: {
      preferFlattenDeep:
        'Prefer `flattenDeep` from es-toolkit instead of `arr.flat(Infinity)`.',
    },
  },
  create(context) {
    return {
      [flatInfinity]: (node: TSESTree.CallExpression) =>
        context.report({ node, messageId: 'preferFlattenDeep' }),
    };
  },
});
