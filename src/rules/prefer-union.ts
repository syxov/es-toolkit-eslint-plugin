import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `new Set([...a, ...b])` — a Set built from a spread-concatenation of at least two arrays.
const unionSet =
  'NewExpression[callee.name="Set"][arguments.length=1][arguments.0.type="ArrayExpression"][arguments.0.elements.0.type="SpreadElement"][arguments.0.elements.1.type="SpreadElement"]';

// `[...new Set([...a, ...b])]` and `Array.from(new Set([...a, ...b]))` both union arrays.
const spreadUnion =
  'ArrayExpression[elements.length=1][elements.0.type="SpreadElement"][elements.0.argument.type="NewExpression"][elements.0.argument.callee.name="Set"][elements.0.argument.arguments.length=1][elements.0.argument.arguments.0.type="ArrayExpression"][elements.0.argument.arguments.0.elements.0.type="SpreadElement"][elements.0.argument.arguments.0.elements.1.type="SpreadElement"]';
const arrayFromUnion = `CallExpression[callee.object.name="Array"][callee.property.name="from"][arguments.length=1]:has(> ${unionSet})`;

export const preferUnion = createRule({
  name: 'prefer-union',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `union` from es-toolkit over deduplicating concatenated arrays through `new Set`.',
    },
    schema: [],
    messages: {
      preferUnion:
        'Prefer `union` from es-toolkit instead of round-tripping concatenated arrays through `new Set`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferUnion' });

    return {
      [spreadUnion]: report,
      [arrayFromUnion]: report,
    };
  },
});
