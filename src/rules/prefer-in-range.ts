import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

interface Bound {
  kind: 'lower' | 'upper';
  value: TSESTree.Node;
}

// The bounded value of `x >= a` / `a <= x` (lower) or `x < b` / `b > x` (upper).
// An inclusive upper bound (`x <= b`) is never one: `inRange` excludes its end.
const boundOf = (node: TSESTree.Node): Bound | undefined => {
  if (node.type !== 'BinaryExpression') return undefined;
  switch (node.operator) {
    case '>=':
      return { kind: 'lower', value: node.left };
    case '<=':
      return { kind: 'lower', value: node.right };
    case '<':
      return { kind: 'upper', value: node.left };
    case '>':
      return { kind: 'upper', value: node.right };
    default:
      return undefined;
  }
};

// In `ok && x >= 0 && x < 10` the comparison before `right` is the left chain's last operand.
const previousOperand = (node: TSESTree.LogicalExpression) =>
  node.left.type === 'LogicalExpression' && node.left.operator === '&&'
    ? node.left.right
    : node.left;

export const preferInRange = createRule({
  name: 'prefer-in-range',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `inRange` from es-toolkit instead of a lower- and upper-bound comparison.',
    },
    schema: [],
    messages: {
      preferInRange:
        'Prefer `inRange` from es-toolkit instead of checking both range bounds by hand.',
    },
  },
  create(context) {
    const isRangePair = (left: TSESTree.Node, right: TSESTree.Node) => {
      const a = boundOf(left);
      const b = boundOf(right);
      return (
        a !== undefined
        && b !== undefined
        && a.kind !== b.kind
        && isSameExpression(context.sourceCode, a.value, b.value)
      );
    };

    // A comparison already paired with the one before it is not paired again, so
    // `x >= 0 && x < 10 && x >= 1` reports once.
    const pairsWithPrevious = (node: TSESTree.LogicalExpression): boolean =>
      isRangePair(previousOperand(node), node.right)
      && !(
        node.left.type === 'LogicalExpression'
        && node.left.operator === '&&'
        && pairsWithPrevious(node.left)
      );

    return {
      'LogicalExpression[operator="&&"]'(node: TSESTree.LogicalExpression) {
        if (!pairsWithPrevious(node)) return;
        context.report({
          node,
          loc: {
            start: previousOperand(node).loc.start,
            end: node.right.loc.end,
          },
          messageId: 'preferInRange',
        });
      },
    };
  },
});
