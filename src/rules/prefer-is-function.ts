import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const typeofOn = (
  typeofSide: 'left' | 'right',
  literalSide: 'left' | 'right',
) =>
  `[${typeofSide}.type="UnaryExpression"][${typeofSide}.operator="typeof"][${literalSide}.type="Literal"][${literalSide}.value="function"]`;

// `typeof` always yields a string, so loose and strict (in)equality are equivalent.
const typeofComparison = `BinaryExpression[operator=/^[!=]==?$/]:matches(${typeofOn('left', 'right')}, ${typeofOn('right', 'left')})`;

export const preferIsFunction = createRule({
  name: 'prefer-is-function',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isFunction` from es-toolkit instead of a `typeof` function check.',
    },
    schema: [],
    messages: {
      preferIsFunction:
        'Prefer `isFunction` from es-toolkit over a `typeof` check.',
    },
  },
  create(context) {
    return {
      [typeofComparison]: (node: TSESTree.BinaryExpression) =>
        context.report({ node, messageId: 'preferIsFunction' }),
    };
  },
});
