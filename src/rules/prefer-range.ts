import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `[...Array(n).keys()]` — a spread of the index iterator of a freshly sized array.
const spreadArrayKeys =
  'ArrayExpression[elements.length=1][elements.0.type="SpreadElement"][elements.0.argument.type="CallExpression"][elements.0.argument.callee.property.name="keys"][elements.0.argument.callee.object.callee.name="Array"]';

// `Array.from({ length: n }, (_, i) => i)` — the mapper returning its index is verified below.
const arrayFromLength =
  'CallExpression[callee.object.name="Array"][callee.property.name="from"][arguments.length=2][arguments.0.type="ObjectExpression"][arguments.0.properties.0.key.name="length"][arguments.1.params.length=2][arguments.1.body.type="Identifier"]';

export const preferRange = createRule({
  name: 'prefer-range',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `range` from es-toolkit over manual index-array construction.',
    },
    schema: [],
    messages: {
      preferRange:
        'Prefer `range` from es-toolkit instead of building an index array by hand.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferRange' });

    return {
      [spreadArrayKeys]: report,
      [arrayFromLength](node: TSESTree.CallExpression) {
        const mapper = node.arguments[1];
        if (
          mapper.type !== 'ArrowFunctionExpression'
          && mapper.type !== 'FunctionExpression'
        )
          return;
        const index = mapper.params[1];
        // Only a mapper that returns its own index parameter yields `range(n)`.
        if (
          index?.type === 'Identifier'
          && mapper.body.type === 'Identifier'
          && mapper.body.name === index.name
        ) {
          report(node);
        }
      },
    };
  },
});
