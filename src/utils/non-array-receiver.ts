import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, isLiteralValue, isSameExpression } from './ast.js';
import { findDescendants, statementScope } from './statement.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Kind = 'string' | 'array-like' | undefined;

// es-toolkit's array utilities take `readonly T[]`: a string, a typed array, a `Buffer` or a
// DOM collection fails to type-check. These helpers find what the syntax and the in-file
// declarations reveal about a receiver; anything else is assumed to be an array.

// String methods with no array counterpart and specific enough not to be a custom object's.
const stringMethods = new Set([
  'charAt',
  'charCodeAt',
  'codePointAt',
  'endsWith',
  'localeCompare',
  'padEnd',
  'padStart',
  'repeat',
  'split',
  'startsWith',
  'substr',
  'substring',
  'toLocaleLowerCase',
  'toLocaleUpperCase',
  'toLowerCase',
  'toUpperCase',
  'trim',
  'trimEnd',
  'trimStart',
]);

// Methods only a string has: none of them exists on an array.
const stringResultMethods = new Set([
  ...stringMethods,
  'match',
  'matchAll',
  'replace',
  'replaceAll',
  'search',
]);

// Methods that return a string whatever their receiver.
const stringReturningMethods = new Set([
  'join',
  'padEnd',
  'padStart',
  'repeat',
  'replace',
  'replaceAll',
  'substr',
  'substring',
  'toDateString',
  'toExponential',
  'toFixed',
  'toISOString',
  'toLocaleDateString',
  'toLocaleLowerCase',
  'toLocaleString',
  'toLocaleTimeString',
  'toLocaleUpperCase',
  'toLowerCase',
  'toPrecision',
  'toString',
  'toTimeString',
  'toUTCString',
  'toUpperCase',
  'trim',
  'trimEnd',
  'trimStart',
]);

// Global functions whose argument is read as a string.
const stringParsers = new Set([
  'atob',
  'btoa',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'Number',
  'parseFloat',
  'parseInt',
  'RegExp',
]);

const domStringProperties = new Set([
  'innerHTML',
  'innerText',
  'nodeValue',
  'outerHTML',
  'textContent',
]);

const locationProperties = new Set([
  'hash',
  'host',
  'hostname',
  'href',
  'origin',
  'pathname',
  'protocol',
  'search',
]);

const typedArray =
  /^(Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float16|Float32|Float64|BigInt64|BigUint64)Array$/;
const arrayLikeType =
  /^(Int8|Uint8|Uint8Clamped|Int16|Uint16|Int32|Uint32|Float16|Float32|Float64|BigInt64|BigUint64)Array$|^(Buffer|NodeList|NodeListOf|HTMLCollection|HTMLCollectionOf)$/;
const domCollectionQuery =
  /^(querySelectorAll|getElementsByClassName|getElementsByName|getElementsByTagName|getElementsByTagNameNS)$/;

const unwrap = (node: TSESTree.Node): TSESTree.Node =>
  node.type === 'TSAsExpression'
  || node.type === 'TSNonNullExpression'
  || node.type === 'TSSatisfiesExpression'
  || node.type === 'TSTypeAssertion'
  || node.type === 'ChainExpression'
    ? unwrap(node.expression)
    : node;

const propertyName = (node: TSESTree.Node) =>
  node.type === 'MemberExpression'
  && !node.computed
  && node.property.type === 'Identifier'
    ? node.property.name
    : undefined;

const calleeName = (call: TSESTree.CallExpression) => {
  const callee = unwrap(call.callee);
  return callee.type === 'Identifier' ? callee.name : propertyName(callee);
};

const isStringLiteral = (node: TSESTree.Node) =>
  (node.type === 'Literal' && typeof node.value === 'string')
  || node.type === 'TemplateLiteral';

const resolve = (sourceCode: SourceCode, node: TSESTree.Identifier) => {
  let scope: TSESLint.Scope.Scope | null = sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable) return variable;
    scope = scope.upper;
  }
  return undefined;
};

// The value an identifier is declared with: `const x = <init>`.
const initialValue = (sourceCode: SourceCode, node: TSESTree.Node) => {
  if (node.type !== 'Identifier') return undefined;
  const definition = resolve(sourceCode, node)?.defs[0];
  return definition?.type === 'Variable'
    && definition.node.id === definition.name
    ? (definition.node.init ?? undefined)
    : undefined;
};

// `location.hash`, `window.location.search`, `new URL(s).pathname`, `url.search` where
// `const url = new URL(s)`.
const isLocation = (sourceCode: SourceCode, node: TSESTree.Node) => {
  const isUrl = (value: TSESTree.Node | undefined) =>
    value?.type === 'NewExpression' && isIdentifierNamed(value.callee, 'URL');
  return (
    isIdentifierNamed(node, 'location')
    || propertyName(node) === 'location'
    || isUrl(node)
    || isUrl(initialValue(sourceCode, node))
  );
};

const pathModule = /^(node:)?path(\/posix|\/win32)?$/;
const pathFunctions =
  /^(basename|dirname|extname|format|join|normalize|relative|resolve|toNamespacedPath)$/;

// `path` from `import path from 'node:path'`, `import * as path from 'path'` or
// `const path = require('path')`, and `join` from `import { join } from 'path'`.
const isPathImport = (sourceCode: SourceCode, node: TSESTree.Node) => {
  if (node.type !== 'Identifier') return false;
  const definition = resolve(sourceCode, node)?.defs[0];
  if (definition?.type === 'ImportBinding')
    return (
      definition.parent.type === 'ImportDeclaration'
      && pathModule.test(definition.parent.source.value)
    );
  const init = initialValue(sourceCode, node);
  return (
    init?.type === 'CallExpression'
    && isIdentifierNamed(init.callee, 'require')
    && init.arguments[0]?.type === 'Literal'
    && pathModule.test(String(init.arguments[0].value))
  );
};

// `path.extname(file)`, `extname(file)`: the `path` module returns strings.
const isPathCall = (sourceCode: SourceCode, node: TSESTree.CallExpression) => {
  const callee = unwrap(node.callee);
  if (callee.type === 'Identifier')
    return pathFunctions.test(callee.name) && isPathImport(sourceCode, callee);
  let object: TSESTree.Node = callee;
  while (object.type === 'MemberExpression') object = object.object;
  return (
    pathFunctions.test(propertyName(callee) ?? '')
    && isPathImport(sourceCode, object)
  );
};

// `document.head.children`, `document.body.childNodes`.
const isDocumentCollection = (node: TSESTree.MemberExpression): boolean => {
  let object: TSESTree.Node = node.object;
  while (object.type === 'MemberExpression') object = object.object;
  return (
    /^(children|childNodes)$/.test(propertyName(node) ?? '')
    && isIdentifierNamed(object, 'document')
  );
};

const typeKind = (type: TSESTree.TypeNode | undefined): Kind => {
  if (!type) return undefined;
  switch (type.type) {
    case 'TSStringKeyword':
    case 'TSTemplateLiteralType':
      return 'string';
    case 'TSLiteralType':
      return isStringLiteral(type.literal) ? 'string' : undefined;
    case 'TSTypeReference':
      return type.typeName.type === 'Identifier'
        && arrayLikeType.test(type.typeName.name)
        ? 'array-like'
        : undefined;
    case 'TSUnionType': {
      const kinds = type.types
        .filter(
          member =>
            member.type !== 'TSNullKeyword'
            && member.type !== 'TSUndefinedKeyword',
        )
        .map(typeKind);
      return kinds.length > 0 && kinds.every(kind => kind === kinds[0])
        ? kinds[0]
        : undefined;
    }
    default:
      return undefined;
  }
};

const annotationKind = (node: TSESTree.Node): Kind =>
  'typeAnnotation' in node && node.typeAnnotation?.type === 'TSTypeAnnotation'
    ? typeKind(node.typeAnnotation.typeAnnotation)
    : undefined;

// `useState('')`, `React.useState<string>()`: the state, not the setter.
const useStateKind = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  depth: number,
): Kind => {
  if (node.type !== 'CallExpression' || calleeName(node) !== 'useState')
    return undefined;
  const typeArgument = node.typeArguments?.params[0];
  if (typeArgument) return typeKind(typeArgument);
  const [initial] = node.arguments as (
    TSESTree.CallExpressionArgument | undefined
  )[];
  return initial ? expressionKind(sourceCode, initial, depth + 1) : undefined;
};

// The kind of the element at `index` of the array pattern `const [a, b] = init`.
const destructuredKind = (
  sourceCode: SourceCode,
  init: TSESTree.Node,
  index: number,
  depth: number,
): Kind => {
  const source = unwrap(init);
  if (index === 0) {
    const state = useStateKind(sourceCode, source, depth);
    if (state) return state;
  }
  // `s.split(…)`, `s.match(re)`, `re.exec(s)` produce strings.
  return source.type === 'CallExpression'
    && /^(split|match|exec)$/.test(calleeName(source) ?? '')
    ? 'string'
    : undefined;
};

// `setValue(previous => previous.slice(0, -1))` where `[value, setValue] = useState('')`.
const setterCallbackKind = (
  sourceCode: SourceCode,
  param: TSESTree.Node,
  depth: number,
): Kind => {
  const fn = param.parent;
  const call = fn?.parent;
  if (
    !fn
    || (fn.type !== 'ArrowFunctionExpression'
      && fn.type !== 'FunctionExpression')
    || fn.params[0] !== param
    || call?.type !== 'CallExpression'
    || call.arguments[0] !== fn
    || call.callee.type !== 'Identifier'
  )
    return undefined;
  const definition = resolve(sourceCode, call.callee)?.defs[0];
  const pattern = definition?.name.parent;
  return definition?.type === 'Variable'
    && pattern?.type === 'ArrayPattern'
    && pattern.elements[1] === definition.name
    && definition.node.init
    ? useStateKind(sourceCode, unwrap(definition.node.init), depth)
    : undefined;
};

// What the in-file declaration of `node` says: its annotation, a string default
// (`(s = '')`, `{ s = '' }`) or its initial value.
const identifierKind = (
  sourceCode: SourceCode,
  node: TSESTree.Identifier,
  depth: number,
): Kind => {
  const definition = resolve(sourceCode, node)?.defs[0];
  if (!definition) return undefined;
  const { name } = definition;
  const annotated = annotationKind(name);
  if (annotated) return annotated;
  const { parent } = name;
  if (
    parent.type === 'AssignmentPattern'
    && parent.left === name
    && expressionKind(sourceCode, parent.right, depth + 1) === 'string'
  )
    return 'string';
  if (definition.type === 'Parameter')
    return setterCallbackKind(sourceCode, name, depth);
  if (definition.type !== 'Variable' || !definition.node.init) return undefined;
  const { init } = definition.node;
  if (definition.node.id === name)
    return expressionKind(sourceCode, init, depth + 1);
  const element = parent.type === 'AssignmentPattern' ? parent : name;
  const pattern = element.parent;
  return pattern.type === 'ArrayPattern' && pattern === definition.node.id
    ? destructuredKind(
        sourceCode,
        init,
        pattern.elements.indexOf(element as TSESTree.DestructuringPattern),
        depth,
      )
    : undefined;
};

const callKind = (
  sourceCode: SourceCode,
  node: TSESTree.CallExpression,
  depth: number,
): Kind => {
  const callee = unwrap(node.callee);
  if (isIdentifierNamed(callee, 'String') || isPathCall(sourceCode, node))
    return 'string';
  if (callee.type !== 'MemberExpression') return undefined;
  const name = propertyName(callee);
  if (!name) return undefined;
  if (isIdentifierNamed(callee.object, 'Buffer')) return 'array-like';
  if (domCollectionQuery.test(name)) return 'array-like';
  if (name === 'stringify' && isIdentifierNamed(callee.object, 'JSON'))
    return 'string';
  if (stringReturningMethods.has(name)) return 'string';
  // `hash.digest('hex')` is a string; `hash.digest()` is a Buffer.
  if (name === 'digest' && node.arguments.length === 1) return 'string';
  if (/^(slice|at)$/.test(name))
    return expressionKind(sourceCode, callee.object, depth + 1);
  return undefined;
};

// What the expression itself (or, for an identifier, its in-file declaration) shows.
const expressionKind = (
  sourceCode: SourceCode,
  expression: TSESTree.Node,
  depth = 0,
): Kind => {
  if (depth > 4) return undefined;
  const node = unwrap(expression);
  switch (node.type) {
    case 'Literal':
      return typeof node.value === 'string' ? 'string' : undefined;
    case 'TemplateLiteral':
      return 'string';
    case 'BinaryExpression':
      return node.operator === '+'
        && (expressionKind(sourceCode, node.left, depth + 1) === 'string'
          || expressionKind(sourceCode, node.right, depth + 1) === 'string')
        ? 'string'
        : undefined;
    // `(s || '')`, `s ?? ''`.
    case 'LogicalExpression':
      return node.operator !== '&&' && isStringLiteral(unwrap(node.right))
        ? 'string'
        : undefined;
    case 'ConditionalExpression':
      return isStringLiteral(unwrap(node.consequent))
        || isStringLiteral(unwrap(node.alternate))
        ? 'string'
        : undefined;
    case 'NewExpression':
      return node.callee.type === 'Identifier'
        && (typedArray.test(node.callee.name) || node.callee.name === 'Buffer')
        ? 'array-like'
        : undefined;
    case 'CallExpression':
      return callKind(sourceCode, node, depth);
    case 'MemberExpression': {
      const object = unwrap(node.object);
      // `s.split('/')[1]`
      if (node.computed)
        return object.type === 'CallExpression'
          && calleeName(object) === 'split'
          && node.property.type === 'Literal'
          && typeof node.property.value === 'number'
          ? 'string'
          : undefined;
      const name = propertyName(node) ?? '';
      if (domStringProperties.has(name)) return 'string';
      if (locationProperties.has(name) && isLocation(sourceCode, object))
        return 'string';
      if (isDocumentCollection(node)) return 'array-like';
      return undefined;
    }
    case 'Identifier':
      return identifierKind(sourceCode, node, depth);
    default:
      return undefined;
  }
};

// The receiver is visibly not an array: a string, a typed array, a `Buffer` or a DOM collection.
export const isNonArrayReceiver = (
  sourceCode: SourceCode,
  receiver: TSESTree.Node,
) => expressionKind(sourceCode, receiver) !== undefined;

// The value of `node` is read as a string: `x.slice(1).trim()`, `x.slice(-1) === '\n'`,
// `parseInt(x.slice(1))`, `path.join(x.slice(1))`, `out += x.slice(1)`,
// `c ? x.slice(1) : ''`, `x.slice(1) || ''`.
export const isUsedAsString = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
): boolean => {
  let child = node;
  let { parent } = node;
  while (parent && unwrap(parent) !== parent) {
    child = parent;
    parent = parent.parent;
  }
  if (!parent) return false;
  const other = (a: TSESTree.Node, b: TSESTree.Node) =>
    unwrap(a === child ? b : a);
  switch (parent.type) {
    case 'MemberExpression':
      return (
        parent.object === child
        && stringResultMethods.has(propertyName(parent) ?? '')
      );
    case 'BinaryExpression':
      return (
        /^[!=]==?$/.test(parent.operator)
        && isStringLiteral(other(parent.left, parent.right))
      );
    case 'AssignmentExpression':
      return parent.operator === '+=' && parent.right === child;
    case 'ConditionalExpression':
      return (
        parent.test !== child
        && isStringLiteral(other(parent.consequent, parent.alternate))
      );
    case 'LogicalExpression':
      return (
        parent.operator !== '&&'
        && isStringLiteral(other(parent.left, parent.right))
      );
    case 'CallExpression':
    case 'NewExpression': {
      if (!parent.arguments.includes(child as TSESTree.CallExpressionArgument))
        return false;
      const callee = unwrap(parent.callee);
      if (callee.type === 'Identifier' && stringParsers.has(callee.name))
        return true;
      if (parent.type === 'CallExpression' && isPathCall(sourceCode, parent))
        return true;
      return (
        callee.type === 'MemberExpression'
        && propertyName(callee) === 'parse'
        && isIdentifierNamed(callee.object, 'JSON')
      );
    }
    default:
      return false;
  }
};

// The same receiver is read as a string next to `node`: `key.startsWith('_') ? key.slice(1) : key`,
// `if (p.endsWith('/')) p = p.slice(0, -1);`, `typeof v === 'string' && v[v.length - 1]`,
// `s.slice(-1) === 'Z' ? s.slice(0, -1) : s`.
export const hasStringGuard = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  receiver: TSESTree.Node,
) => {
  const isReceiver = (candidate: TSESTree.Node) =>
    isSameExpression(sourceCode, candidate, receiver);
  const readsAsString = (candidate: TSESTree.Node) => {
    if (
      candidate.type === 'UnaryExpression'
      && candidate.operator === 'typeof'
      && isReceiver(candidate.argument)
    ) {
      const { parent } = candidate;
      return (
        parent.type === 'BinaryExpression'
        && /^[!=]==?$/.test(parent.operator)
        && isLiteralValue(
          parent.left === candidate ? parent.right : parent.left,
          'string',
        )
      );
    }
    if (
      candidate.type !== 'CallExpression'
      || candidate.callee.type !== 'MemberExpression'
      || !isReceiver(candidate.callee.object)
    )
      return false;
    const method = propertyName(candidate.callee) ?? '';
    return (
      stringMethods.has(method)
      || (candidate !== node
        && method === 'slice'
        && isUsedAsString(sourceCode, candidate))
    );
  };
  return statementScope(node).some(
    scope => findDescendants(sourceCode, scope, readsAsString).length > 0,
  );
};

// `x.slice(…)` on something that is visibly not an array, or whose result is read as a string.
export const isNonArraySlice = (
  sourceCode: SourceCode,
  call: TSESTree.CallExpression,
) =>
  call.callee.type === 'MemberExpression'
  && (isNonArrayReceiver(sourceCode, call.callee.object)
    || isUsedAsString(sourceCode, call)
    || hasStringGuard(sourceCode, call, call.callee.object));
