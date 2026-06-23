import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const set = 'NewExpression[callee.name="Set"][arguments.length=1]';

// Both `[...new Set(arr)]` and `Array.from(new Set(arr))` deduplicate an array.
const spreadSet =
  'ArrayExpression[elements.length=1][elements.0.type="SpreadElement"][elements.0.argument.type="NewExpression"][elements.0.argument.callee.name="Set"][elements.0.argument.arguments.length=1]';
const arrayFromSet = `CallExpression[callee.object.name="Array"][callee.property.name="from"][arguments.length=1]:has(> ${set})`;

export const preferUniq = createRule({
  name: 'prefer-uniq',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `uniq` from es-toolkit over `new Set` round-trips.',
    },
    schema: [],
    messages: {
      preferUniq:
        'Prefer `uniq` from es-toolkit instead of round-tripping through `new Set`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferUniq' });

    return {
      [spreadSet]: report,
      [arrayFromSet]: report,
    };
  },
});
