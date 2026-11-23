import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isSameExpression, isWriteTarget } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  entryParams,
  methodCall,
  objectStaticCall,
  readsParam,
} from '../utils/entries-map.js';

type Callback = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;
type SourceCode = Readonly<TSESLint.SourceCode>;

const callback = (path: string) =>
  `[${path}type=/^(ArrowFunctionExpression|FunctionExpression)$/][${path}params.length=1]`;

// `Object.keys(o).find(k => …)`.
const keysFind = `CallExpression${methodCall('', 'find')}${objectStaticCall('callee.object.', 'keys')}${callback('arguments.0.')}[arguments.0.params.0.type="Identifier"]`;

// `Object.entries(o).find(([k, v]) => …)`.
const entriesFind = (path: string) =>
  `${methodCall(path, 'find')}${objectStaticCall(`${path}callee.object.`, 'entries')}${callback(`${path}arguments.0.`)}[${path}arguments.0.params.0.type="ArrayPattern"]`;

// `….find(…)[0]`, `….find(…)?.[0]` and `….find(…)![0]`: the key of the found entry.
const entriesFindKey = `MemberExpression[computed=true][property.type="Literal"][property.raw="0"]:matches(${entriesFind('object.')}, [object.type="TSNonNullExpression"]${entriesFind('object.expression.')})`;

// The callback reads `o[k]`, the object's value at the key.
const readsValueAtKey = (
  sourceCode: SourceCode,
  find: TSESTree.CallExpression,
) => {
  const object = (
    (find.callee as TSESTree.MemberExpression).object as TSESTree.CallExpression
  ).arguments[0];
  const fn = find.arguments[0] as Callback;
  const [param] = fn.params as [TSESTree.Identifier];
  const variable = sourceCode
    .getDeclaredVariables(fn)
    .find(({ name }) => name === param.name);
  return !!variable?.references.some(({ identifier }) => {
    const { parent } = identifier;
    return (
      parent.type === 'MemberExpression'
      && parent.computed
      && parent.property === identifier
      && isSameExpression(sourceCode, parent.object, object)
      && !isWriteTarget(parent)
    );
  });
};

// The entry callback tests the value, so `findKey` can take it as `(value, key)`.
const testsValue = (sourceCode: SourceCode, find: TSESTree.CallExpression) => {
  const fn = find.arguments[0] as Callback;
  const params = entryParams(fn);
  return params !== null && readsParam(sourceCode, fn, params.value, fn.body);
};

const unwrapNonNull = (node: TSESTree.Expression) =>
  node.type === 'TSNonNullExpression' ? node.expression : node;

export const preferFindKey = createRule({
  name: 'prefer-find-key',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `findKey` from es-toolkit instead of `Object.keys(o).find(k => pred(o[k]))`.',
    },
    schema: [],
    messages: {
      preferFindKey:
        'Prefer `findKey` from es-toolkit instead of searching `Object.keys(o)` or `Object.entries(o)` with `.find`.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      [keysFind](node: TSESTree.CallExpression) {
        if (readsValueAtKey(sourceCode, node))
          context.report({ node, messageId: 'preferFindKey' });
      },
      [entriesFindKey](node: TSESTree.MemberExpression) {
        const find = unwrapNonNull(node.object) as TSESTree.CallExpression;
        if (!isWriteTarget(node) && testsValue(sourceCode, find))
          context.report({ node, messageId: 'preferFindKey' });
      },
    };
  },
});
