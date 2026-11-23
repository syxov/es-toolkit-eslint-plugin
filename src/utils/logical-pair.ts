import type { TSESTree } from '@typescript-eslint/utils';

type Operator = TSESTree.LogicalExpression['operator'];
type IsPair = (
  operator: Operator,
  left: TSESTree.Node,
  right: TSESTree.Node,
) => boolean;

// In `a || b || c` (parsed as `(a || b) || c`) the operand next to `c` is `b`.
const lastOperand = (node: TSESTree.Node, operator: Operator) =>
  node.type === 'LogicalExpression' && node.operator === operator
    ? node.right
    : node;

// The two adjacent operands that end at `node.right`, so every adjacent pair of a chain is
// visited exactly once.
export const pairEndingAt = (
  node: TSESTree.LogicalExpression,
): [TSESTree.Node, TSESTree.Node] => [
  lastOperand(node.left, node.operator),
  node.right,
];

// `node` is one operand of an adjacent pair `isPair` accepts, which is reported as a whole.
export const isPairOperand = (node: TSESTree.Node, isPair: IsPair) => {
  const { parent } = node;
  if (parent?.type !== 'LogicalExpression') return false;
  const { operator } = parent;
  if (parent.left === node) return isPair(operator, node, parent.right);
  if (isPair(operator, lastOperand(parent.left, operator), node)) return true;
  const outer = parent.parent;
  return (
    outer.type === 'LogicalExpression'
    && outer.operator === operator
    && outer.left === parent
    && isPair(operator, node, outer.right)
  );
};
