import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, referencesParam } from './ast.js';

// In every fragment `path` is the attribute prefix of the matched node ('' for the selector
// subject, otherwise ending in a dot).

// A two-element array literal ending in a plain identifier: the shape of `[key, p]`.
const entryShape = (path: string) =>
  `[${path}type="ArrayExpression"][${path}elements.length=2][${path}elements.1.type="Identifier"]`;

// A one-parameter callback that returns `[key, p]`, either as an expression-bodied arrow or
// from a body made of a single `return`.
export const keyEntryCallback = (path: string) =>
  `[${path}type=/^(ArrowFunctionExpression|FunctionExpression)$/][${path}params.length=1][${path}params.0.type="Identifier"]:matches(${entryShape(`${path}body.`)}, [${path}body.body.length=1][${path}body.body.0.type="ReturnStatement"]${entryShape(`${path}body.body.0.argument.`)})`;

// `xs.map(p => [key, p])` without a `thisArg`. `isKeyEntryMap` checks the names.
export const keyEntryMap = (path: string) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.property.name="map"][${path}arguments.length=1]${keyEntryCallback(`${path}arguments.0.`)}`;

const returnedExpression = (
  body: TSESTree.BlockStatement | TSESTree.Expression,
) => {
  if (body.type !== 'BlockStatement') return body;
  const [statement] = body.body;
  return statement.type === 'ReturnStatement' ? statement.argument : null;
};

// A `keyEntryMap` match whose entry is `[key, p]` for the callback's own parameter `p`, with
// a key that reads `p` without being `p` itself (`[u, u]` maps each element to itself).
export const isKeyEntryMap = (
  sourceCode: Readonly<TSESLint.SourceCode>,
  map: TSESTree.Node,
) => {
  if (map.type !== 'CallExpression') return false;
  const callback = map.arguments[0];
  if (
    callback.type !== 'ArrowFunctionExpression'
    && callback.type !== 'FunctionExpression'
  )
    return false;
  const [param] = callback.params;
  const entry = returnedExpression(callback.body);
  if (param.type !== 'Identifier' || entry?.type !== 'ArrayExpression')
    return false;
  const [key, value] = entry.elements;
  return (
    key !== null
    && key.type !== 'SpreadElement'
    && !isIdentifierNamed(key, param.name)
    && value !== null
    && isIdentifierNamed(value, param.name)
    && referencesParam(sourceCode, callback, key)
  );
};
