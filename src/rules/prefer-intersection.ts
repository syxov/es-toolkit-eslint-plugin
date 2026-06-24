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

export const preferIntersection = createRule({
  name: 'prefer-intersection',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `intersection` from es-toolkit over `a.filter(x => b.includes(x))`.',
    },
    schema: [],
    messages: {
      preferIntersection:
        'Prefer `intersection` from es-toolkit instead of filtering for members of another array.',
    },
  },
  create(context) {
    return {
      [filterArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [param] = arrow.params;
        if (param.type !== 'Identifier') return;

        // `x => b.includes(x)` — bare `.includes`, not the negated `difference` form.
        if (isIncludesOfParam(arrow.body, param.name))
          context.report({ node, messageId: 'preferIntersection' });
      },
    };
  },
});
