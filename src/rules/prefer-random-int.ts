import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isSampleIndex } from '../utils/is-sample-index.js';

const random =
  'CallExpression[callee.object.name="Math"][callee.property.name="random"]';

// `Math.random() * X` or `X * Math.random()`.
const product = `BinaryExpression[operator="*"]:has(> ${random})`;

// Each idiom truncates that product to an int: `Math.floor`/`Math.trunc`, `~~`, or `| 0`.
const truncCall = `CallExpression[callee.object.name="Math"][callee.property.name=/^(floor|trunc)$/][arguments.length=1]:has(> ${product})`;
const doubleTilde = `UnaryExpression[operator="~"]:has(> UnaryExpression[operator="~"]:has(> ${product}))`;
// `raw` rather than `value`: esquery compares values as strings, so `| '0'` would match too.
const bitwiseOr = `BinaryExpression[operator="|"][right.type="Literal"][right.raw="0"]:has(> ${product})`;

export const preferRandomInt = createRule({
  name: 'prefer-random-int',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `randomInt` from es-toolkit instead of truncating `Math.random() * …` to an int.',
    },
    schema: [],
    messages: {
      preferRandomInt:
        'Prefer `randomInt` from es-toolkit instead of truncating `Math.random() * …` to an int.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) => {
      const { parent } = node;
      // `arr[Math.floor(Math.random() * arr.length)]` is reported by prefer-sample.
      if (
        parent?.type === 'MemberExpression'
        && parent.property === node
        && isSampleIndex(context.sourceCode, parent)
      )
        return;
      context.report({ node, messageId: 'preferRandomInt' });
    };

    return {
      [truncCall]: report,
      [doubleTilde]: report,
      [bitwiseOr]: report,
    };
  },
});
