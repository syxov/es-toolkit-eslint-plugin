import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `new Set([...a, ...b])` (exactly two spreads) is a union, owned by `prefer-union`, so that
// one shape is excluded here. Three spreads or a spread plus a value stay a plain dedupe.
const notUnion = (path: string) =>
  `:not([${path}.type="ArrayExpression"][${path}.elements.length=2][${path}.elements.0.type="SpreadElement"][${path}.elements.1.type="SpreadElement"])`;

const set = `NewExpression[callee.name="Set"][arguments.length=1]${notUnion('arguments.0')}`;

// Both `[...new Set(arr)]` and `Array.from(new Set(arr))` deduplicate an array.
const spreadSet = `ArrayExpression[elements.length=1][elements.0.type="SpreadElement"][elements.0.argument.type="NewExpression"][elements.0.argument.callee.name="Set"][elements.0.argument.arguments.length=1]${notUnion('elements.0.argument.arguments.0')}`;
const arrayFromSet = `CallExpression[callee.object.name="Array"][callee.property.name="from"][arguments.length=1]:has(> ${set})`;

export const preferUniq = createRule({
  name: 'prefer-uniq',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `uniq` from es-toolkit instead of `new Set` round-trips.',
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
