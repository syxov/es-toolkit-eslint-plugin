import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const random =
  'CallExpression[callee.object.name="Math"][callee.property.name="random"]';

// `Math.random() * X`. A `.length` multiplier is left to `prefer-sample`.
const product = `BinaryExpression[operator="*"]:has(> ${random}):not(:has(> MemberExpression[property.name="length"]))`;

// Each idiom truncates that product to an int: `Math.floor`/`Math.trunc`, `~~`, or `| 0`.
const truncCall = `CallExpression[callee.object.name="Math"][callee.property.name=/^(floor|trunc)$/][arguments.length=1]:has(> ${product})`;
const doubleTilde = `UnaryExpression[operator="~"]:has(> UnaryExpression[operator="~"]:has(> ${product}))`;
const bitwiseOr = `BinaryExpression[operator="|"][right.value=0]:has(> ${product})`;

export const preferRandomInt = createRule({
  name: 'prefer-random-int',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `randomInt` from es-toolkit over truncating `Math.random() * …` to an int.',
    },
    schema: [],
    messages: {
      preferRandomInt:
        'Prefer `randomInt` from es-toolkit instead of truncating `Math.random() * …` to an int.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferRandomInt' });

    return {
      [truncCall]: report,
      [doubleTilde]: report,
      [bitwiseOr]: report,
    };
  },
});
