import { ASTUtils } from '@typescript-eslint/utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Definition = TSESLint.Scope.Definition;

// `declare const x`, `declare function f()`, `declare class C`: a type for a binding that the
// runtime may or may not provide.
const isAmbient = ({ node, parent }: Definition) =>
  (parent?.type === 'VariableDeclaration' && parent.declare)
  || ((node.type === 'TSDeclareFunction'
    || node.type === 'ClassDeclaration'
    || node.type === 'TSEnumDeclaration')
    && node.declare);

// The code itself creates the binding: a declaration, an import or a parameter. Built-in and
// configured globals (`window`, `process`, `Intl`), `/* global */` comments, `declare global`
// members and ambient `declare` statements only describe an environment that may be missing at
// runtime, where reading the identifier throws a ReferenceError.
export const isDeclaredInCode = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
) => {
  const variable = ASTUtils.findVariable(
    sourceCode.getScope(identifier),
    identifier,
  );
  if (!variable) return false;
  // `arguments` is implicit but always exists inside a function.
  if (variable.defs.length === 0) return variable.scope.type !== 'global';
  return variable.defs.some(def => !isAmbient(def));
};

// A bare identifier that resolves to no binding the code creates, such as `window`.
export const isUndeclaredIdentifier = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) => node.type === 'Identifier' && !isDeclaredInCode(sourceCode, node);

const isEsToolkitImport = ({ type, parent }: Definition) =>
  type === 'ImportBinding'
  && parent.type === 'ImportDeclaration'
  && /^es-toolkit(?:\/|$)/.test(parent.source.value);

// The code at `node` already sees its own binding named like the suggested helper (a local
// `isString` flag, a project `isNumber` that also rejects NaN), so `isString(x)` would clash
// with it. An import of the helper from es-toolkit is no clash.
export const bindsHelperName = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  name: string,
) =>
  ASTUtils.findVariable(sourceCode.getScope(node), name)?.defs.some(
    def => !isEsToolkitImport(def),
  ) ?? false;
