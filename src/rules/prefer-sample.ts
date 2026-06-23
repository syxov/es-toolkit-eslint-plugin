import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `arr[Math.floor(Math.random() * arr.length)]` — a random index into an array's length.
const randomIndex =
  'MemberExpression[computed=true][property.callee.object.name="Math"][property.callee.property.name="floor"]:has(CallExpression[callee.object.name="Math"][callee.property.name="random"]):has(MemberExpression[property.name="length"])';

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
    return {
      [randomIndex]: (node: TSESTree.Node) =>
        context.report({ node, messageId: 'preferSample' }),
    };
  },
});
