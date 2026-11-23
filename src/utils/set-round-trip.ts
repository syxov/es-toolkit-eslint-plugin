import {
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';

type SourceCode = Readonly<TSESLint.SourceCode>;

// The `new Set(x)` of `[...new Set(x)]` or `Array.from(new Set(x))`, shared by prefer-uniq
// and prefer-union.
const newSet = 'NewExpression[callee.name="Set"][arguments.length=1]';
export const setRoundTrip = `ArrayExpression[elements.length=1] > SpreadElement > ${newSet}, CallExpression[callee.object.name="Array"][callee.property.name="from"][arguments.length=1] > ${newSet}`;

// The whole round-trip expression around the matched `new Set(x)`.
export const roundTripOf = (set: TSESTree.NewExpression) =>
  set.parent.type === 'SpreadElement' ? set.parent.parent : set.parent;

const setOrMapType = /^(Readonly)?(Set|Map)$/;

const isNewSetOrMap = (node: TSESTree.Node | null) =>
  node?.type === 'NewExpression'
  && node.callee.type === 'Identifier'
  && setOrMapType.test(node.callee.name);

// A local declared as `new Set(…)` / `new Map(…)` or annotated `Set<T>`, `ReadonlyMap<K, V>`, ….
const isDeclaredSetOrMap = (
  sourceCode: SourceCode,
  node: TSESTree.Identifier,
) =>
  ASTUtils.findVariable(sourceCode.getScope(node), node)?.defs.some(
    ({ node: declarator }) => {
      if (declarator.type !== 'VariableDeclarator') return false;
      const annotation = declarator.id.typeAnnotation?.typeAnnotation;
      return (
        isNewSetOrMap(declarator.init)
        || (annotation?.type === 'TSTypeReference'
          && annotation.typeName.type === 'Identifier'
          && setOrMapType.test(annotation.typeName.name))
      );
    },
  ) ?? false;

// `m.keys()`, `s.values()`, `new Set(…)` or a local Set/Map: iterable, but not an array, so
// `union` (which calls `arr1.concat`) cannot take it. `Object.keys(o)` returns an array.
const isNonArrayIterable = (sourceCode: SourceCode, node: TSESTree.Node) =>
  isNewSetOrMap(node)
  || (node.type === 'Identifier' && isDeclaredSetOrMap(sourceCode, node))
  || (node.type === 'CallExpression'
    && node.callee.type === 'MemberExpression'
    && !node.callee.computed
    && node.callee.property.type === 'Identifier'
    && /^(keys|values|entries)$/.test(node.callee.property.name)
    && !isIdentifierNamed(node.callee.object, 'Object'));

// `[...a, ...b]` over two arrays: the `new Set` argument that `union(a, b)` replaces.
export const isArrayUnion = (sourceCode: SourceCode, node: TSESTree.Node) =>
  node.type === 'ArrayExpression'
  && node.elements.length === 2
  && node.elements.every(
    element =>
      element?.type === 'SpreadElement'
      && !isNonArrayIterable(sourceCode, element.argument),
  );

// `s.match(re)` returns `null` without a match: `new Set(null)` is empty, `uniq(null)` throws.
export const isMatchCall = (node: TSESTree.Node) =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && !node.callee.computed
  && isIdentifierNamed(node.callee.property, 'match');
