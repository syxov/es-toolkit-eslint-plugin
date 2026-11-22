import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  isIdentifierNamed,
  isLiteralValue,
  isSameExpression,
  isWriteTarget,
} from './ast.js';

const isMathCall = (node: TSESTree.Node, method: RegExp) =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && !node.callee.computed
  && isIdentifierNamed(node.callee.object, 'Math')
  && node.callee.property.type === 'Identifier'
  && method.test(node.callee.property.name);

// The operand truncated by `Math.floor(…)`, `Math.trunc(…)`, `~~(…)` or `(…) | 0`.
const truncatedOperand = (node: TSESTree.Node) => {
  if (node.type === 'CallExpression' && node.arguments.length === 1)
    return isMathCall(node, /^(floor|trunc)$/) ? node.arguments[0] : undefined;
  if (
    node.type === 'UnaryExpression'
    && node.operator === '~'
    && node.argument.type === 'UnaryExpression'
    && node.argument.operator === '~'
  )
    return node.argument.argument;
  if (
    node.type === 'BinaryExpression'
    && node.operator === '|'
    && isLiteralValue(node.right, 0)
  )
    return node.left;
  return undefined;
};

// `n` in a truncated `Math.random() * n` or `n * Math.random()`.
const randomMultiplier = (node: TSESTree.Node) => {
  const product = truncatedOperand(node);
  if (product?.type !== 'BinaryExpression' || product.operator !== '*')
    return undefined;
  if (isMathCall(product.left, /^random$/)) return product.right;
  if (isMathCall(product.right, /^random$/)) return product.left;
  return undefined;
};

// `arr[Math.floor(Math.random() * arr.length)]` read as a value: the index scales
// `Math.random()` by the `.length` of the very array it indexes.
export const isSampleIndex = (
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.MemberExpression,
) => {
  if (!node.computed || isWriteTarget(node)) return false;
  const multiplier = randomMultiplier(node.property);
  return (
    multiplier?.type === 'MemberExpression'
    && !multiplier.computed
    && isIdentifierNamed(multiplier.property, 'length')
    && isSameExpression(sourceCode, node.object, multiplier.object)
  );
};
