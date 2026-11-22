import type { TSESTree } from '@typescript-eslint/utils';

// `<reduce> / <…>.length`: the whole division belongs to `prefer-mean` / `prefer-mean-by`,
// so the sum rules skip the `reduce` on its left.
export const isMeanNumerator = (node: TSESTree.CallExpression) => {
  const { parent } = node;
  return (
    parent.type === 'BinaryExpression'
    && parent.operator === '/'
    && parent.left === node
    && parent.right.type === 'MemberExpression'
    && parent.right.property.type === 'Identifier'
    && parent.right.property.name === 'length'
  );
};
