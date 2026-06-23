import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const filterBoolean =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.name="Boolean"]';

// `.filter(x => …)` with a single single-parameter arrow predicate; its body is checked below.
const filterArrow =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=1][arguments.0.params.0.type="Identifier"]';

const isParam = (node: TSESTree.Node, param: string) =>
  node.type === 'Identifier' && node.name === param;

export const preferCompact = createRule({
  name: 'prefer-compact',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `compact` from es-toolkit over a truthiness filter.',
    },
    schema: [],
    messages: {
      preferCompact:
        'Prefer `compact` from es-toolkit instead of filtering by truthiness.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferCompact' });

    return {
      [filterBoolean]: report,
      [filterArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [param] = arrow.params;
        if (param.type !== 'Identifier') return;
        const { body } = arrow;

        // The predicate keeps only truthy values: `x => !!x` or `x => Boolean(x)`.
        const isDoubleBang =
          body.type === 'UnaryExpression'
          && body.operator === '!'
          && body.argument.type === 'UnaryExpression'
          && body.argument.operator === '!'
          && isParam(body.argument.argument, param.name);
        const isBooleanCall =
          body.type === 'CallExpression'
          && body.callee.type === 'Identifier'
          && body.callee.name === 'Boolean'
          && body.arguments.length === 1
          && isParam(body.arguments[0], param.name);

        if (isDoubleBang || isBooleanCall) report(node);
      },
    };
  },
});
