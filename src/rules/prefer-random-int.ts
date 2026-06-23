import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const random =
  'CallExpression[callee.object.name="Math"][callee.property.name="random"]';

// `Math.floor(Math.random() * X)`. A `.length` multiplier is left to `prefer-sample`.
const floorRandom = `CallExpression[callee.object.name="Math"][callee.property.name="floor"][arguments.length=1]:has(> BinaryExpression[operator="*"]:has(> ${random}):not(:has(> MemberExpression[property.name="length"])))`;

export const preferRandomInt = createRule({
  name: 'prefer-random-int',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `randomInt` from es-toolkit over `Math.floor(Math.random() * …)`.',
    },
    schema: [],
    messages: {
      preferRandomInt:
        'Prefer `randomInt` from es-toolkit instead of `Math.floor(Math.random() * …)`.',
    },
  },
  create(context) {
    return {
      [floorRandom]: (node: TSESTree.Node) =>
        context.report({ node, messageId: 'preferRandomInt' }),
    };
  },
});
