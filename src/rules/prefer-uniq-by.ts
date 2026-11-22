import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isKeyEntryMap, keyEntryMap } from '../utils/key-entry-callback.js';

// `new Map(xs.map(p => [key, p])).values()`, with `path` as the attribute prefix of the
// `.values()` call (ending in a dot).
const mapValues = (path: string) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.property.name="values"][${path}arguments.length=0][${path}callee.object.type="NewExpression"][${path}callee.object.callee.type="Identifier"][${path}callee.object.callee.name="Map"][${path}callee.object.arguments.length=1]${keyEntryMap(`${path}callee.object.arguments.0.`)}`;

const spreadMapValues = `ArrayExpression[elements.length=1][elements.0.type="SpreadElement"]${mapValues('elements.0.argument.')}`;
const arrayFromMapValues = `CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.object.name="Array"][callee.property.name="from"][arguments.length=1]${mapValues('arguments.0.')}`;

// The selectors guarantee the shape; this only walks down to the `new Map(…)` expression.
const newMapOf = (values: TSESTree.Node) =>
  ((values as TSESTree.CallExpression).callee as TSESTree.MemberExpression)
    .object as TSESTree.NewExpression;

export const preferUniqBy = createRule({
  name: 'prefer-uniq-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `uniqBy` from es-toolkit instead of reading the values of `new Map(xs.map(x => [key, x]))`.',
    },
    schema: [],
    messages: {
      preferUniqBy:
        'Prefer `uniqBy` from es-toolkit instead of reading the values of `new Map(xs.map(x => [key, x]))`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node, values: TSESTree.Node) => {
      if (isKeyEntryMap(context.sourceCode, newMapOf(values).arguments[0]))
        context.report({ node, messageId: 'preferUniqBy' });
    };

    return {
      [spreadMapValues](node: TSESTree.ArrayExpression) {
        report(node, (node.elements[0] as TSESTree.SpreadElement).argument);
      },
      [arrayFromMapValues](node: TSESTree.CallExpression) {
        report(node, node.arguments[0]);
      },
    };
  },
});
