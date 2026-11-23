import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type SourceCode = Readonly<TSESLint.SourceCode>;

export const isIdentifierNamed = (node: TSESTree.Node, name: string) =>
  node.type === 'Identifier' && node.name === name;

export const isLiteralValue = (
  node: TSESTree.Node,
  value: string | number | boolean | null,
) => node.type === 'Literal' && node.value === value;

// Type-only wrappers do not change the value: `(xs as T[])`, `xs!`, `<T[]>xs`, `xs satisfies T`.
export const stripTypeWrappers = (node: TSESTree.Node): TSESTree.Node =>
  node.type === 'TSAsExpression'
  || node.type === 'TSNonNullExpression'
  || node.type === 'TSSatisfiesExpression'
  || node.type === 'TSTypeAssertion'
    ? stripTypeWrappers(node.expression)
    : node;

// Syntactic identity: `a.b[0]` and `a.b[0]` match, `a` and `b` do not, and `(a as T[])`
// matches `a`.
export const isSameExpression = (
  sourceCode: SourceCode,
  left: TSESTree.Node,
  right: TSESTree.Node,
) =>
  sourceCode.getText(stripTypeWrappers(left))
  === sourceCode.getText(stripTypeWrappers(right));

// The node is written to rather than read: `a[0] = x`, `a[0]++`, `delete a[0]`,
// `[a[0]] = xs`, `({ k: a[0] } = o)`, `for (a[0] of xs)`.
export const isWriteTarget = (node: TSESTree.Node): boolean => {
  const { parent } = node;
  if (!parent) return false;
  switch (parent.type) {
    case 'AssignmentExpression':
    case 'AssignmentPattern':
    case 'ForInStatement':
    case 'ForOfStatement':
      return parent.left === node;
    case 'UpdateExpression':
    case 'ArrayPattern':
    case 'RestElement':
      return true;
    case 'UnaryExpression':
      return parent.operator === 'delete';
    case 'Property':
      return parent.value === node && parent.parent.type === 'ObjectPattern';
    default:
      return false;
  }
};

// `node` reads one of `fn`'s own parameters (property names like `obj.x` do not count).
export const referencesParam = (
  sourceCode: SourceCode,
  fn: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
  node: TSESTree.Node,
) =>
  sourceCode
    .getDeclaredVariables(fn)
    .some(variable =>
      variable.references.some(
        ({ identifier }) =>
          identifier.range[0] >= node.range[0]
          && identifier.range[1] <= node.range[1],
      ),
    );
