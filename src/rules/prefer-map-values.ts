import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  entryCallback,
  mapCall,
  objectFromEntries,
  returnedExpression,
} from '../utils/entries-map.js';

type Callback = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

// `Object.entries(o)`.
const objectEntries = (path: string) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.object.name="Object"][${path}callee.property.name="entries"][${path}arguments.length=1]`;

// The `[k, v]` parameter: exactly two plain identifiers, no defaults, rest or nesting.
const keyValuePattern = (path: string) =>
  `[${path}type="ArrayPattern"][${path}elements.length=2][${path}elements.0.type="Identifier"][${path}elements.1.type="Identifier"]`;

// `[k, value]`: a two-element array literal led by an identifier, with no spread.
const valueEntry = (path: string) =>
  `[${path}type="ArrayExpression"][${path}elements.length=2][${path}elements.0.type="Identifier"][${path}elements.1.type!="SpreadElement"]`;

// `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, value]))`.
const fromEntriesOfMappedEntries = `${objectFromEntries}${mapCall('arguments.0.')}${objectEntries('arguments.0.callee.object.')}${entryCallback('arguments.0.arguments.0.', valueEntry)}${keyValuePattern('arguments.0.arguments.0.params.0.')}`;

// The selector guarantees the shape; this only walks down to the `.map` callback.
const mapCallbackOf = (fromEntries: TSESTree.CallExpression) =>
  (fromEntries.arguments[0] as TSESTree.CallExpression)
    .arguments[0] as Callback;

// The entry keeps the destructured key and replaces the value (`[k, v]` is a plain copy).
const mapsValueOnly = (callback: Callback) => {
  const [keyParam, valueParam] = (callback.params[0] as TSESTree.ArrayPattern)
    .elements as TSESTree.Identifier[];
  const [key, value] = (
    returnedExpression(callback.body) as TSESTree.ArrayExpression
  ).elements;
  return (
    key !== null
    && isIdentifierNamed(key, keyParam.name)
    && value !== null
    && !isIdentifierNamed(value, valueParam.name)
  );
};

export const preferMapValues = createRule({
  name: 'prefer-map-values',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `mapValues` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))`.',
    },
    schema: [],
    messages: {
      preferMapValues:
        'Prefer `mapValues` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfMappedEntries](node: TSESTree.CallExpression) {
        if (mapsValueOnly(mapCallbackOf(node)))
          context.report({ node, messageId: 'preferMapValues' });
      },
    };
  },
});
