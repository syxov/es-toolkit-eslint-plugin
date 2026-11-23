import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type SourceCode = Readonly<TSESLint.SourceCode>;

const isFunction = (node: TSESTree.Node) =>
  node.type === 'ArrowFunctionExpression'
  || node.type === 'FunctionExpression'
  || node.type === 'FunctionDeclaration';

const simpleStatements = new Set([
  'ExpressionStatement',
  'VariableDeclaration',
  'ReturnStatement',
  'ThrowStatement',
]);

// The simple statement holding `node`. Inside a compound statement (`if`, loops) or a function
// it stops at the header expression or the arrow's expression body.
export const enclosingStatement = (node: TSESTree.Node): TSESTree.Node => {
  let current = node;
  while (current.parent) {
    const { parent } = current;
    if (simpleStatements.has(parent.type)) return parent;
    if (
      isFunction(parent)
      || parent.type === 'PropertyDefinition'
      || /(Statement|Declaration)$/.test(parent.type)
    )
      return current;
    current = parent;
  }
  return current;
};

// The descendants of `root` (itself included) that satisfy `predicate`, nested functions too.
export const findDescendants = (
  sourceCode: SourceCode,
  root: TSESTree.Node,
  predicate: (node: TSESTree.Node) => boolean,
): TSESTree.Node[] => {
  const found: TSESTree.Node[] = [];
  const visit = (node: TSESTree.Node) => {
    if (predicate(node)) found.push(node);
    for (const key of sourceCode.visitorKeys[node.type] ?? []) {
      const child = (node as unknown as Record<string, unknown>)[key];
      for (const item of Array.isArray(child) ? child : [child])
        if (item && typeof (item as TSESTree.Node).type === 'string')
          visit(item as TSESTree.Node);
    }
  };
  visit(root);
  return found;
};

// The nodes `node` is read alongside: its statement, plus the test of an `if` it is the
// branch of (`if (s.endsWith('/')) s = s.slice(0, -1);`).
export const statementScope = (node: TSESTree.Node): TSESTree.Node[] => {
  const statement = enclosingStatement(node);
  const branchOf =
    statement.parent?.type === 'BlockStatement'
      ? statement.parent.parent
      : statement.parent;
  return branchOf?.type === 'IfStatement' && branchOf.test !== statement
    ? [statement, branchOf.test]
    : [statement];
};
