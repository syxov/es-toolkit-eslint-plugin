import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  findVariable,
  variableSources,
  type VariableSource,
} from './variable-sources.js';

type SourceCode = Readonly<TSESLint.SourceCode>;

// `xs[0]` reads a fixed slot rather than the first element of a list when `xs` is a
// string, a DOM collection, a regex match, a tuple or an argument list. These helpers
// recognise such receivers syntactically, following local variables to their values.

// Type-only wrappers do not change the value: `xs!`, `xs as T[]`.
export const unwrapTypes = (node: TSESTree.Node): TSESTree.Node =>
  node.type === 'TSNonNullExpression'
  || node.type === 'TSAsExpression'
  || node.type === 'TSSatisfiesExpression'
  || node.type === 'TSTypeAssertion'
    ? unwrapTypes(node.expression)
    : node;

const propertyName = (node: TSESTree.Node): string | undefined =>
  node.type === 'MemberExpression'
  && !node.computed
  && node.property.type === 'Identifier'
    ? node.property.name
    : undefined;

const calleeOf = (node: TSESTree.Node) =>
  node.type === 'CallExpression' ? node.callee : undefined;

const methodName = (node: TSESTree.Node) => {
  const callee = calleeOf(node);
  return callee && propertyName(callee);
};

const functionName = (node: TSESTree.Node) => {
  const callee = calleeOf(node);
  return callee?.type === 'Identifier' ? callee.name : undefined;
};

// Methods whose result is a string, a regex match, a DOM collection or a fixed-size tuple.
const positionalMethods = new RegExp(
  `^(${[
    'charAt|join|normalize|pad(Start|End)|repeat|replace(All)?|stringify|substr(ing)?|toFixed|toString|to(Locale)?(Lower|Upper)Case|trim(Start|End)?',
    'exec|match|split',
    'getClientRects|getElementsBy(ClassName|Name|TagName|TagNameNS)|querySelectorAll',
    'domain|extent|hrtime|range|useReducer|useState',
  ].join('|')})$`,
);
const positionalFunctions = /^(extent|String|useReducer|useState)$/;
const domCollections =
  /^(addedNodes|changedTouches|childNodes|cssRules|removedNodes|selectedOptions|styleSheets|targetTouches|touches)$/;
// Argument lists (also of test doubles) and AST child slots: `[0]` is "argument #0".
const argumentSlots =
  /^(args|argv|arguments|declarations|expressions|firstCall|heritageClauses|invocationCallOrder|lastCall|calls|parameters|params|quasis|specifiers|typeArguments|typeParameters)$/;
const argumentNames = /^(args|argv|arguments|parameters|params)$/;
const mockData = /^(contexts|instances|results)$/;
const fileSources = /^(currentTarget|dataTransfer|target)$/;
// A copy or a selection: `xs.slice(-1)[0]` is `last`, `xs.filter(p)[0]` is `find`.
const selectionMethods = /^(filter|slice|splice)$/;
// Calls that keep the elements of their receiver.
const elementPreservingMethods =
  /^(filter|reverse|slice|sort|toReversed|toSorted)$/;
const iterationMethods =
  /^(every|filter|find|findIndex|findLast|findLastIndex|flatMap|forEach|map|some)$/;

const isPositionalValue = (expression: TSESTree.Node): boolean => {
  const node = unwrapTypes(expression);
  if (node.type === 'Literal') return typeof node.value === 'string';
  if (node.type === 'TemplateLiteral') return true;
  if (positionalMethods.test(methodName(node) ?? '')) return true;
  if (positionalFunctions.test(functionName(node) ?? '')) return true;
  if (node.type !== 'MemberExpression') return false;
  const property = propertyName(node) ?? '';
  const owner = propertyName(node.object) ?? '';
  return (
    domCollections.test(property)
    || argumentSlots.test(property)
    || (mockData.test(property) && owner === 'mock')
    || (property === 'files' && fileSources.test(owner))
  );
};

// Iterables whose elements are tuples or strings: entries, regex matches, split segments.
const hasPositionalElements = (expression: TSESTree.Node): boolean => {
  let node = unwrapTypes(expression);
  while (
    node.type === 'CallExpression'
    && node.callee.type === 'MemberExpression'
    && elementPreservingMethods.test(propertyName(node.callee) ?? '')
  )
    node = unwrapTypes(node.callee.object);
  return /^(entries|matchAll|split)$/.test(methodName(node) ?? '');
};

const valueSourcesOf = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
): TSESTree.Node[] => {
  const variable = findVariable(sourceCode, identifier);
  return variable
    ? variableSources(variable).flatMap(source =>
        source.kind === 'value' ? [source.node] : [],
      )
    : [];
};

const isPositionalSource = (
  sourceCode: SourceCode,
  source: VariableSource,
): boolean => {
  if (source.kind === 'value') return isPositionalValue(source.node);
  if (source.kind === 'element') return hasPositionalElements(source.iterable);
  const { callee } = source.call;
  if (callee.type !== 'MemberExpression') return false;
  const method = propertyName(callee) ?? '';
  // `.sort((a, b) => a[0] - b[0])` compares tuples.
  if (/^(sort|toSorted)$/.test(method)) return source.index <= 1;
  if (!iterationMethods.test(method) || source.index !== 0) return false;
  const iterable = unwrapTypes(callee.object);
  return (
    hasPositionalElements(iterable)
    || (iterable.type === 'Identifier'
      && valueSourcesOf(sourceCode, iterable).some(hasPositionalElements))
  );
};

// `s: string`, `p: [number, number]`, `p: readonly [number, number]`.
const isPositionalType = (type: TSESTree.TypeNode): boolean =>
  type.type === 'TSStringKeyword'
  || type.type === 'TSTupleType'
  || (type.type === 'TSTypeOperator'
    && type.typeAnnotation !== undefined
    && isPositionalType(type.typeAnnotation));

const isPositionalAnnotation = (
  sourceCode: SourceCode,
  id: TSESTree.Identifier,
) =>
  findVariable(sourceCode, id)?.defs.some(
    ({ name }) =>
      name.type === 'Identifier'
      && name.typeAnnotation !== undefined
      && isPositionalType(name.typeAnnotation.typeAnnotation),
  ) ?? false;

const isPositionalIdentifier = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
) => {
  if (argumentNames.test(identifier.name)) return true;
  if (isPositionalAnnotation(sourceCode, identifier)) return true;
  const variable = findVariable(sourceCode, identifier);
  return (
    variable !== null
    && variableSources(variable).some(source =>
      isPositionalSource(sourceCode, source),
    )
  );
};

// `xs[i][0]`, `xs[0][0]` and `xs.at(-1)[0]` index a nested tuple; `map['key'][0]` reads a
// keyed list.
const isNestedIndex = (node: TSESTree.Node) =>
  methodName(node) === 'at'
  || (node.type === 'MemberExpression'
    && node.computed
    && !(
      node.property.type === 'Literal'
      && typeof node.property.value === 'string'
    ));

const hasOptionalLink = (node: TSESTree.Node): boolean => {
  switch (node.type) {
    case 'MemberExpression':
      return node.optional || hasOptionalLink(node.object);
    case 'CallExpression':
      return node.optional || hasOptionalLink(node.callee);
    case 'TSNonNullExpression':
      return hasOptionalLink(node.expression);
    default:
      return false;
  }
};

// The receiver of `receiver[0]` is not a plain list, or the read cannot become `head(…)`
// (`x?.[0]`: `head(undefined)` throws).
export const isPositionalReceiver = (
  sourceCode: SourceCode,
  node: TSESTree.MemberExpression,
): boolean => {
  if (hasOptionalLink(node)) return true;
  const receiver = unwrapTypes(node.object);
  if (isNestedIndex(receiver)) return true;
  if (selectionMethods.test(methodName(receiver) ?? '')) return true;
  if (receiver.type === 'Identifier')
    return isPositionalIdentifier(sourceCode, receiver);
  return isPositionalValue(receiver);
};
