// where a local variable's value comes from (init, for…of element, callback param)

import {
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Variable = TSESLint.Scope.Variable;

// Where a local variable's value comes from: an assigned expression, an element of a
// `for…of` iterable, or the `index`-th parameter of a callback passed to `call`.
export type VariableSource =
  | { kind: 'value'; node: TSESTree.Expression }
  | { kind: 'element'; iterable: TSESTree.Expression }
  | { kind: 'callback'; call: TSESTree.CallExpression; index: number };

export const findVariable = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
): Variable | null =>
  ASTUtils.findVariable(sourceCode.getScope(identifier), identifier);

const writeSource = (
  identifier: TSESTree.Identifier,
): VariableSource | undefined => {
  const { parent } = identifier;
  if (parent.type === 'AssignmentExpression')
    return parent.left === identifier && parent.operator === '='
      ? { kind: 'value', node: parent.right }
      : undefined;
  if (parent.type !== 'VariableDeclarator' || parent.id !== identifier)
    return undefined;
  const loop = parent.parent.parent;
  if (loop.type === 'ForOfStatement' && loop.left === parent.parent)
    return { kind: 'element', iterable: loop.right };
  return parent.init ? { kind: 'value', node: parent.init } : undefined;
};

const callbackSource = (
  identifier: TSESTree.Node,
  fn: TSESTree.Node,
): VariableSource | undefined => {
  const call = fn.parent;
  if (
    (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression')
    || call?.type !== 'CallExpression'
    || !call.arguments.includes(fn)
  )
    return undefined;
  const index = fn.params.findIndex(param => param === identifier);
  return index === -1 ? undefined : { kind: 'callback', call, index };
};

// Only plain bindings (`const x = …`, `x = …`, `for (const x of …)`, `(x) => …`) count;
// destructured ones are skipped.
export const variableSources = (variable: Variable): VariableSource[] => [
  ...variable.references.flatMap(({ identifier }) => {
    const source =
      identifier.type === 'Identifier' ? writeSource(identifier) : undefined;
    return source ? [source] : [];
  }),
  ...variable.defs.flatMap(def => {
    const source =
      def.type === 'Parameter' ? callbackSource(def.name, def.node) : undefined;
    return source ? [source] : [];
  }),
];
