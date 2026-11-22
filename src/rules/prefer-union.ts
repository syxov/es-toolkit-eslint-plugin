import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `[...a, ...b]`: exactly two spreads, matching `union(arr1, arr2)`. `prefer-uniq` excludes
// the same shape.
const twoSpreads = (path: string) =>
  `[${path}.type="ArrayExpression"][${path}.elements.length=2][${path}.elements.0.type="SpreadElement"][${path}.elements.1.type="SpreadElement"]`;

const unionSet = `NewExpression[callee.name="Set"][arguments.length=1]${twoSpreads('arguments.0')}`;

// `[...new Set([...a, ...b])]` and `Array.from(new Set([...a, ...b]))` both union arrays.
const spreadUnion = `ArrayExpression[elements.length=1][elements.0.type="SpreadElement"][elements.0.argument.type="NewExpression"][elements.0.argument.callee.name="Set"][elements.0.argument.arguments.length=1]${twoSpreads('elements.0.argument.arguments.0')}`;
const arrayFromUnion = `CallExpression[callee.object.name="Array"][callee.property.name="from"][arguments.length=1]:has(> ${unionSet})`;

export const preferUnion = createRule({
  name: 'prefer-union',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `union` from es-toolkit instead of deduplicating two concatenated arrays through `new Set`.',
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
