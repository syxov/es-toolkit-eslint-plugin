// `xs.map(p => [key, p])` entry callbacks: prefer-key-by, prefer-uniq-by

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, referencesParam } from './ast.js';
import { entryCallback, mapCall, returnedExpression } from './entries-map.js';

// In every fragment `path` is the attribute prefix of the matched node ('' for the selector
// subject, otherwise ending in a dot).

// A two-element array literal ending in a plain identifier: the shape of `[key, p]`.
const entryShape = (path: string) =>
  `[${path}type="ArrayExpression"][${path}elements.length=2][${path}elements.1.type="Identifier"]`;

// A one-parameter callback that returns `[key, p]`, either as an expression-bodied arrow or
// from a body made of a single `return`.
export const keyEntryCallback = (path: string) =>
  `${entryCallback(path, entryShape)}[${path}params.0.type="Identifier"]`;

// `xs.map(p => [key, p])` without a `thisArg`. `isKeyEntryMap` checks the names.
export const keyEntryMap = (path: string) =>
  `${mapCall(path)}${keyEntryCallback(`${path}arguments.0.`)}`;

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
