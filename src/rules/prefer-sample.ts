import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const random =
  'CallExpression[callee.object.name="Math"][callee.property.name="random"]';
const length = 'MemberExpression[property.name="length"]';

// A computed access `arr[<index>]` whose index draws on `Math.random()` and an array `.length`.
const randomIndexAccess = (index: string) =>
  `MemberExpression[computed=true]${index}:has(${random}):has(${length})`;

// The index truncates to an int via `Math.floor`/`Math.trunc`, `~~`, or `| 0`.
const truncCall =
  '[property.callee.object.name="Math"][property.callee.property.name=/^(floor|trunc)$/]';
const doubleTilde =
  '[property.type="UnaryExpression"][property.operator="~"][property.argument.type="UnaryExpression"][property.argument.operator="~"]';
const bitwiseOr =
  '[property.type="BinaryExpression"][property.operator="|"][property.right.value=0]';

export const preferSample = createRule({
  name: 'prefer-sample',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `sample` from es-toolkit over random-index array access.',
    },
    schema: [],
    messages: {
      preferSample:
        'Prefer `sample` from es-toolkit instead of indexing with a random index.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferSample' });

    return {
      [randomIndexAccess(truncCall)]: report,
      [randomIndexAccess(doubleTilde)]: report,
      [randomIndexAccess(bitwiseOr)]: report,
    };
  },
});
