import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';

// `arr.reduce((a, b) => a + b)` or `arr.reduce((a, b) => a + b, 0)`: no seed or the number
// `0` (`raw`, because esquery would also match the string `'0'` by `value`).
// Shared by `prefer-sum` and `prefer-mean`, which owns the same reduce when it is divided by its `.length`.
export const sumReduce =
  'CallExpression[callee.property.name="reduce"][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=2][arguments.0.params.0.type="Identifier"][arguments.0.params.1.type="Identifier"][arguments.0.body.type="BinaryExpression"][arguments.0.body.operator="+"]:matches([arguments.length=1], [arguments.length=2][arguments.1.raw="0"])';

// The reducer adds exactly its own two params, in either order: `(a, b) => b + a`.
export const isSumReducer = (node: TSESTree.CallExpression) => {
  const arrow = node.arguments[0];
  if (
    arrow.type !== 'ArrowFunctionExpression'
    || arrow.body.type !== 'BinaryExpression'
  )
    return false;
  const [first, second] = arrow.params;
  if (first.type !== 'Identifier' || second.type !== 'Identifier') return false;
  const { left, right } = arrow.body;
  return (
    (isIdentifierNamed(left, first.name)
      && isIdentifierNamed(right, second.name))
    || (isIdentifierNamed(left, second.name)
      && isIdentifierNamed(right, first.name))
  );
};

// `items.reduce((acc, item) => acc + item.value, 0)`. The numeric `0` seed is required: without
// one the accumulator starts as the first item. `raw`, because esquery would match `'0'` by `value`.
// Shared by `prefer-sum-by` and `prefer-mean-by`, which owns the same reduce when it is divided by its `.length`.
export const sumByReduce =
  'CallExpression[callee.property.name="reduce"][arguments.length=2][arguments.1.raw="0"][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=2][arguments.0.params.0.type="Identifier"][arguments.0.params.1.type="Identifier"][arguments.0.body.type="BinaryExpression"][arguments.0.body.operator="+"]';

// One side is the accumulator, the other a direct property of the item: `acc + item.value`.
export const isSumByReducer = (node: TSESTree.CallExpression) => {
  const arrow = node.arguments[0];
  if (
    arrow.type !== 'ArrowFunctionExpression'
    || arrow.body.type !== 'BinaryExpression'
  )
    return false;
  const [acc, item] = arrow.params;
  if (acc.type !== 'Identifier' || item.type !== 'Identifier') return false;
  const isItemProperty = (side: TSESTree.Node) =>
    side.type === 'MemberExpression'
    && isIdentifierNamed(side.object, item.name);
  const { left, right } = arrow.body;
  return (
    (isIdentifierNamed(left, acc.name) && isItemProperty(right))
    || (isItemProperty(left) && isIdentifierNamed(right, acc.name))
  );
};
