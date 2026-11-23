import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

type JsonMethod = 'parse' | 'stringify';

// A non-computed `JSON.<method>(arg)` call with exactly one non-spread argument; `path` is
// the attribute prefix of the call node ('' for the selector subject).
const jsonCall = (path: string, method: JsonMethod) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.object.type="Identifier"][${path}callee.object.name="JSON"][${path}callee.property.name="${method}"][${path}arguments.length=1]:not([${path}arguments.0.type="SpreadElement"])`;

// `JSON.parse(JSON.stringify(x))`: a reviver or replacer changes the round-trip, so only the
// one-argument form of both calls is a plain deep clone.
const jsonRoundTrip = `CallExpression${jsonCall('', 'parse')}${jsonCall('arguments.0.', 'stringify')}`;

// Names that announce the JSON semantics themselves. A function says what it does
// (`sanitizeError`, `toSerializableMeta`, `detachSnapshot`, `toPlainObject`); a variable only
// what it holds (`resultJson`), so `const serialized = JSON.parse(…)` is still a clone.
const functionIntent = /seriali[sz]|saniti[sz]|json|detach|plain/i;
const variableIntent = /json|plain/i;

const keyName = (key: TSESTree.Node) =>
  key.type === 'Identifier' ? key.name : undefined;

const functionName = (fn: TSESTree.Node) => {
  if (
    (fn.type === 'FunctionDeclaration' || fn.type === 'FunctionExpression')
    && fn.id
  )
    return fn.id.name;
  const { parent } = fn;
  if (parent?.type === 'VariableDeclarator') return keyName(parent.id);
  if (
    parent?.type === 'Property'
    || parent?.type === 'MethodDefinition'
    || parent?.type === 'PropertyDefinition'
  )
    return keyName(parent.key);
  return undefined;
};

// The leftmost name of a call chain: `expect` in `expect(a).not.toEqual(b)`.
const chainRoot = (node: TSESTree.Node): TSESTree.Node => {
  if (node.type === 'MemberExpression') return chainRoot(node.object);
  if (node.type === 'CallExpression') return chainRoot(node.callee);
  return node;
};

const calleeName = (call: TSESTree.CallExpression) => {
  const { callee } = call;
  if (callee.type === 'Identifier') return callee.name;
  return callee.type === 'MemberExpression'
    ? keyName(callee.property)
    : undefined;
};

// Deliberate JSON semantics, told apart by context: an assertion that a value survives JSON
// (`expect(JSON.parse(JSON.stringify(ast))).toEqual(ast)`), a benchmark of the round-trip
// itself, or code named after serialising or sanitising.
const isDeliberateJson = (node: TSESTree.Node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'CallExpression') {
      const root = chainRoot(current.callee);
      if (root.type === 'Identifier' && root.name === 'expect') return true;
      if (/^bench/i.test(calleeName(current) ?? '')) return true;
    }
    if (
      current.type === 'VariableDeclarator'
      && variableIntent.test(keyName(current.id) ?? '')
    )
      return true;
    if (
      current.type.includes('Function')
      && functionIntent.test(functionName(current) ?? '')
    )
      return true;
  }
  return false;
};

export const preferCloneDeep = createRule({
  name: 'prefer-clone-deep',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `cloneDeep` from es-toolkit instead of `JSON.parse(JSON.stringify(x))`.',
    },
    schema: [],
    messages: {
      preferCloneDeep:
        'Prefer `cloneDeep` from es-toolkit instead of a `JSON.parse(JSON.stringify(…))` round-trip.',
    },
  },
  create(context) {
    return {
      [jsonRoundTrip]: (node: TSESTree.CallExpression) => {
        if (!isDeliberateJson(node))
          context.report({ node, messageId: 'preferCloneDeep' });
      },
    };
  },
});
