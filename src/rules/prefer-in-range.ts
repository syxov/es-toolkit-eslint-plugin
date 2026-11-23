import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

interface Bound {
  kind: 'lower' | 'upper';
  value: TSESTree.Node;
  limit: TSESTree.Node;
  valueFirst: boolean;
}

// The bounded value of `x >= a` / `a <= x` (lower) or `x < b` / `b > x` (upper).
// An inclusive upper bound (`x <= b`) is never one: `inRange` excludes its end.
const boundOf = (node: TSESTree.Node): Bound | undefined => {
  if (node.type !== 'BinaryExpression') return undefined;
  const { left, right } = node;
  switch (node.operator) {
    case '>=':
      return { kind: 'lower', value: left, limit: right, valueFirst: true };
    case '<=':
      return { kind: 'lower', value: right, limit: left, valueFirst: false };
    case '<':
      return { kind: 'upper', value: left, limit: right, valueFirst: true };
    case '>':
      return { kind: 'upper', value: right, limit: left, valueFirst: false };
    default:
      return undefined;
  }
};

// `10`, `-1.5`: `inRange` throws when `min >= max`, so only literal bounds are provably safe.
const numberOf = (node: TSESTree.Node): number | undefined => {
  if (node.type === 'Literal')
    return typeof node.value === 'number' ? node.value : undefined;
  if (node.type !== 'UnaryExpression' || node.operator !== '-')
    return undefined;
  const magnitude = numberOf(node.argument);
  return magnitude === undefined ? undefined : -magnitude;
};

// The value reads as the subject: `x >= a && x < b`, `x < b && x >= a` or `a <= x && x < b`.
// `dx > eps && dy <= eps` shares the threshold, not the subject.
const isSubjectShape = (first: Bound, second: Bound) =>
  second.valueFirst && (first.valueFirst || first.kind === 'lower');

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
      const first = boundOf(left);
      const second = boundOf(right);
      if (!first || !second || first.kind === second.kind) return false;
      const [lower, upper] =
        first.kind === 'lower' ? [first, second] : [second, first];
      const min = numberOf(lower.limit);
      const max = numberOf(upper.limit);
      return (
        min !== undefined
        && max !== undefined
        && min < max
        && isSubjectShape(first, second)
        && isSameExpression(context.sourceCode, first.value, second.value)
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
