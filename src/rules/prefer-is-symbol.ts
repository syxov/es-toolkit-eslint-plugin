import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofOn = (
  typeofSide: 'left' | 'right',
  literalSide: 'left' | 'right',
) =>
  `[${typeofSide}.type="UnaryExpression"][${typeofSide}.operator="typeof"][${literalSide}.type="Literal"][${literalSide}.value="symbol"]`;

// `typeof` always yields a string, so loose and strict (in)equality are equivalent.
const typeofComparison = `BinaryExpression[operator=/^[!=]==?$/]:matches(${typeofOn('left', 'right')}, ${typeofOn('right', 'left')})`;

export const preferIsSymbol = createRule({
  name: 'prefer-is-symbol',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isSymbol` from es-toolkit instead of a `typeof` check.',
    },
    schema: [],
    messages: {
      preferIsSymbol:
        'Prefer `isSymbol` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison]: (node: TSESTree.BinaryExpression) =>
        context.report({ node, messageId: 'preferIsSymbol' }),
    };
  },
});
