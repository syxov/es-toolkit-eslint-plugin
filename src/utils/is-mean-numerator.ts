import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, isSameExpression } from './ast.js';

// `xs.reduce(…) / xs.length`: the division belongs to `prefer-mean` / `prefer-mean-by`, so the
// sum rules skip the `reduce` on its left. A different denominator (`a.reduce(…) / b.length`)
// is not a mean and stays with the sum rules. Every rule in the family uses this one check.
export const isMeanNumerator = (
  node: TSESTree.CallExpression,
  sourceCode: Readonly<TSESLint.SourceCode>,
) => {
  const { parent, callee } = node;
  return (
    parent.type === 'BinaryExpression'
    && parent.operator === '/'
    && parent.left === node
    && parent.right.type === 'MemberExpression'
    && !parent.right.computed
    && isIdentifierNamed(parent.right.property, 'length')
    && callee.type === 'MemberExpression'
    && isSameExpression(sourceCode, callee.object, parent.right.object)
  );
};
