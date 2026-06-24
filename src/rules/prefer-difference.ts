import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `.filter(x => …)` with a single single-parameter arrow predicate; its body is checked below.
const filterArrow =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=1][arguments.0.params.0.type="Identifier"]';

const isParam = (node: TSESTree.Node, name: string) =>
  node.type === 'Identifier' && node.name === name;

// `<other>.includes(<param>)` — a single-arg `.includes` of the predicate's own parameter.
const isIncludesOfParam = (node: TSESTree.Node, name: string) =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && node.callee.property.type === 'Identifier'
  && node.callee.property.name === 'includes'
  && node.arguments.length === 1
  && isParam(node.arguments[0], name);

export const preferDifference = createRule({
  name: 'prefer-difference',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `difference` from es-toolkit over `a.filter(x => !b.includes(x))`.',
    },
    schema: [],
    messages: {
      preferDifference:
        'Prefer `difference` from es-toolkit instead of filtering out members of another array.',
    },
  },
  create(context) {
    return {
      [filterArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [param] = arrow.params;
        if (param.type !== 'Identifier') return;
        const { body } = arrow;

        // `x => !b.includes(x)`.
        if (
          body.type === 'UnaryExpression'
          && body.operator === '!'
          && isIncludesOfParam(body.argument, param.name)
        )
          context.report({ node, messageId: 'preferDifference' });
      },
    };
  },
});
