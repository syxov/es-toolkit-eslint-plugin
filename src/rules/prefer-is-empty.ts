import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const objectKeysLength = (path: string) =>
  `[${path}.property.name="length"][${path}.object.callee.object.name="Object"][${path}.object.callee.property.name="keys"]`;

// `Object.keys(obj).length === 0`, in either operand order.
const keysLengthZero = (zero: 'left' | 'right', keys: 'left' | 'right') =>
  `BinaryExpression[operator=/^===?$/][${zero}.value=0]${objectKeysLength(keys)}`;

// `!Object.keys(obj).length` — a falsy length means no keys.
const notKeysLength = `UnaryExpression[operator="!"]${objectKeysLength('argument')}`;

export const preferIsEmpty = createRule({
  name: 'prefer-is-empty',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `isEmpty` from es-toolkit over `Object.keys(obj).length === 0`.',
    },
    schema: [],
    messages: {
      preferIsEmpty:
        'Prefer `isEmpty` from es-toolkit instead of `Object.keys(obj).length === 0`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferIsEmpty' });

    return {
      [keysLengthZero('right', 'left')]: report,
      [keysLengthZero('left', 'right')]: report,
      [notKeysLength]: report,
    };
  },
});
