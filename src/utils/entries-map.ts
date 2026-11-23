import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Callback = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

// Fragments for `xs.map(cb)` calls whose callback returns a `[key, value]` entry, and for
// `Object.fromEntries(Object.entries(o).method(cb))` frames. In every fragment `path` is the
// attribute prefix of the matched node ('' for the selector subject, otherwise ending in a dot).

// `Object.fromEntries(entries)` with a single argument; fragments for it go on `arguments.0.`.
export const objectFromEntries =
  'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.object.name="Object"][callee.property.name="fromEntries"][arguments.length=1]';

// `Object.<method>(o)`, e.g. `Object.entries(o)` or `Object.keys(o)`.
export const objectStaticCall = (path: string, method: string) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.object.name="Object"][${path}callee.property.name="${method}"][${path}arguments.length=1]`;

// `xs.<method>(cb)` without a `thisArg`.
export const methodCall = (path: string, method: string) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.property.name="${method}"][${path}arguments.length=1]`;

// `xs.map(cb)` without a `thisArg`.
export const mapCall = (path: string) => methodCall(path, 'map');

// Any expression: the value a predicate callback returns.
export const anyExpression = (path: string) =>
  `[${path}type][${path}type!="BlockStatement"]`;

// A callback whose returned value matches `returned`, either as an expression-bodied arrow
// or from a body made of a single `return`.
export const returningCallback = (
  path: string,
  returned: (path: string) => string,
) =>
  `[${path}type=/^(ArrowFunctionExpression|FunctionExpression)$/]:matches(${returned(`${path}body.`)}, [${path}body.body.length=1][${path}body.body.0.type="ReturnStatement"]${returned(`${path}body.body.0.argument.`)})`;

// A one-parameter `returningCallback`.
export const entryCallback = (
  path: string,
  returned: (path: string) => string,
) => `${returningCallback(path, returned)}[${path}params.length=1]`;

// The value an `entryCallback` returns, or null for any other body.
export const returnedExpression = (
  body: TSESTree.BlockStatement | TSESTree.Expression,
) => {
  if (body.type !== 'BlockStatement') return body;
  const [statement] = body.body;
  return statement.type === 'ReturnStatement' ? statement.argument : null;
};

// `Object.fromEntries(Object.entries(o).<method>(cb))`, where `callback` describes `cb`.
export const objectEntriesFrame = (
  method: string,
  callback: (path: string) => string,
) =>
  `${objectFromEntries}${methodCall('arguments.0.', method)}${objectStaticCall('arguments.0.callee.object.', 'entries')}${callback('arguments.0.arguments.0.')}`;

// The callback of an `objectEntriesFrame` match; the selector guarantees the shape.
export const frameCallback = (fromEntries: TSESTree.CallExpression) =>
  (fromEntries.arguments[0] as TSESTree.CallExpression)
    .arguments[0] as Callback;

// The `[k, v]` parameter: exactly two plain identifiers, no defaults, rest or nesting.
export const keyValuePattern = (path: string) =>
  `[${path}type="ArrayPattern"][${path}elements.length=2][${path}elements.0.type="Identifier"][${path}elements.1.type="Identifier"]`;

// `[key, value]`: a two-element array literal with no spread.
const entryLiteral = (path: string) =>
  `[${path}type="ArrayExpression"][${path}elements.length=2][${path}elements.0.type!="SpreadElement"][${path}elements.1.type!="SpreadElement"]`;

// `Object.fromEntries(Object.entries(o).map(([k, v]) => [key, value]))`.
export const fromEntriesOfMappedEntries = objectEntriesFrame(
  'map',
  path =>
    `${entryCallback(path, entryLiteral)}${keyValuePattern(`${path}params.0.`)}`,
);

// The destructured entry of a callback: `[k, v]`, `[k]` or `[, v]`, each slot a plain
// identifier or a hole. Null for any other parameter list.
export const entryParams = (callback: Callback) => {
  if (callback.params.length !== 1) return null;
  const [param] = callback.params;
  if (param.type !== 'ArrayPattern') return null;
  const { elements } = param;
  if (elements.length === 0 || elements.length > 2) return null;
  if (elements.some(element => element && element.type !== 'Identifier'))
    return null;
  const [key = null, value = null] = elements as (TSESTree.Identifier | null)[];
  return key || value ? { key, value } : null;
};

// `node` reads the parameter `param` of `fn`.
export const readsParam = (
  sourceCode: SourceCode,
  fn: Callback,
  param: TSESTree.Identifier | null,
  node: TSESTree.Node,
) =>
  param !== null
  && sourceCode
    .getDeclaredVariables(fn)
    .some(
      variable =>
        variable.name === param.name
        && variable.references.some(
          ({ identifier }) =>
            identifier.range[0] >= node.range[0]
            && identifier.range[1] <= node.range[1],
        ),
    );

export type EntryMapping = 'invert' | 'keys' | 'values';

// What a `fromEntriesOfMappedEntries` callback changes: the value only (`mapValues`), the
// key only (`mapKeys`), or both swapped (`invert`). Null for a plain copy, for a callback
// that changes both, and for a key that does not come from the old key.
export const entryMapping = (
  sourceCode: SourceCode,
  callback: Callback,
): EntryMapping | null => {
  const [keyParam, valueParam] = (callback.params[0] as TSESTree.ArrayPattern)
    .elements as TSESTree.Identifier[];
  const [key, value] = (
    returnedExpression(callback.body) as TSESTree.ArrayExpression
  ).elements;
  if (key === null || value === null) return null;
  const keepsKey = isIdentifierNamed(key, keyParam.name);
  const keepsValue = isIdentifierNamed(value, valueParam.name);
  if (keepsKey) return keepsValue ? null : 'values';
  if (
    isIdentifierNamed(key, valueParam.name)
    && isIdentifierNamed(value, keyParam.name)
  )
    return 'invert';
  return keepsValue && readsParam(sourceCode, callback, keyParam, key)
    ? 'keys'
    : null;
};
