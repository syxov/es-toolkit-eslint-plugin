import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  isIdentifierNamed,
  isSameExpression,
  referencesParam,
} from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  mapCall,
  returnedExpression,
  returningCallback,
} from '../utils/entries-map.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Callback = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

// In every fragment `path` is the attribute prefix of the matched node ('' for the selector
// subject, otherwise ending in a dot).

// An array literal of at least two elements; `zipsAtIndex` checks the elements.
const tuple = (path: string) =>
  `[${path}type="ArrayExpression"][${path}elements.length>=2]`;

// `(x, i) => [...]`: exactly two plain identifier parameters (type annotations allowed).
const indexedTupleCallback = (path: string) =>
  `${returningCallback(path, tuple)}[${path}params.length=2][${path}params.0.type="Identifier"][${path}params.1.type="Identifier"]`;

// `a.map((x, i) => [...])` without a `thisArg`.
const tupleMap = `CallExpression${mapCall('')}${indexedTupleCallback('arguments.0.')}`;

type Element = TSESTree.ArrayExpression['elements'][number];

// `<expr>[i]` for the bare index parameter, where `<expr>` is a fixed array (it reads neither
// callback parameter).
const isIndexed = (
  sourceCode: SourceCode,
  callback: Callback,
  element: Element,
  index: TSESTree.Identifier,
): element is TSESTree.MemberExpression =>
  element?.type === 'MemberExpression'
  && element.computed
  && isIdentifierNamed(element.property, index.name)
  && !referencesParam(sourceCode, callback, element.object);

// `[x, b[i], …]` or `[a[i], b[i], …]`: the receiver's own element first, then other arrays
// read at the same index.
const zipsAtIndex = (sourceCode: SourceCode, map: TSESTree.CallExpression) => {
  const callback = map.arguments[0] as Callback;
  const [item, index] = callback.params as TSESTree.Identifier[];
  const [first, ...rest] = (
    returnedExpression(callback.body) as TSESTree.ArrayExpression
  ).elements;
  const receiver = (map.callee as TSESTree.MemberExpression).object;
  const firstIsItem =
    (first !== null && isIdentifierNamed(first, item.name))
    || (isIndexed(sourceCode, callback, first, index)
      && isSameExpression(sourceCode, first.object, receiver));
  return (
    firstIsItem
    && rest.every(element => isIndexed(sourceCode, callback, element, index))
  );
};

export const preferZip = createRule({
  name: 'prefer-zip',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `zip` from es-toolkit instead of `a.map((x, i) => [x, b[i]])`.',
    },
    schema: [],
    messages: {
      preferZip:
        'Prefer `zip` from es-toolkit instead of `a.map((x, i) => [x, b[i]])`.',
    },
  },
  create(context) {
    return {
      [tupleMap](node: TSESTree.CallExpression) {
        if (zipsAtIndex(context.sourceCode, node))
          context.report({ node, messageId: 'preferZip' });
      },
    };
  },
});
