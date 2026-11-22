import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofOn = (
  typeofSide: 'left' | 'right',
  literalSide: 'left' | 'right',
) =>
  `[${typeofSide}.type="UnaryExpression"][${typeofSide}.operator="typeof"][${literalSide}.type="Literal"][${literalSide}.value="number"]`;

// `typeof` always yields a string, so loose and strict (in)equality are equivalent.
const typeofComparison = `BinaryExpression[operator=/^[!=]==?$/]:matches(${typeofOn('left', 'right')}, ${typeofOn('right', 'left')})`;

export const preferIsNumber = createRule({
  name: 'prefer-is-number',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isNumber` from es-toolkit instead of a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsNumber:
        'Prefer `isNumber` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison]: (node: TSESTree.BinaryExpression) =>
        context.report({ node, messageId: 'preferIsNumber' }),
    };
  },
});
