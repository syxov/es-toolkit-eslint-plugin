import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, referencesParam } from './ast.js';
import {
  anyExpression,
  entryParams,
  frameCallback,
  objectEntriesFrame,
  returnedExpression,
  returningCallback,
} from './entries-map.js';
import { unwrapTypes } from './positional-receiver.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Callback = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

// `Object.fromEntries(Object.entries(o).filter(([k, v]) => pred))`; `entryFilter` checks the
// destructured entry.
export const fromEntriesOfFilteredEntries = objectEntriesFrame(
  'filter',
  path =>
    `${returningCallback(path, anyExpression)}[${path}params.length=1][${path}params.0.type="ArrayPattern"]`,
);

// `pick`/`omit` take a list of keys; `pickBy`/`omitBy` take a `(value, key)` predicate. The
// frame keeps an entry when the predicate holds, so a negated predicate (`!pred`) and a key
// exclusion (`k !== 'a'`) belong to the omit side.
export type EntryFilter = 'omit' | 'omitBy' | 'pick' | 'pickBy';

interface Context {
  sourceCode: SourceCode;
  callback: Callback;
  key: TSESTree.Identifier | null;
}

// An expression that does not depend on the entry: a key list, a set, a key literal.
const isEntryIndependent = (
  { sourceCode, callback }: Context,
  node: TSESTree.Node,
) => !referencesParam(sourceCode, callback, node);

const isKeyParam = ({ key }: Context, node: TSESTree.Node) =>
  key !== null && isIdentifierNamed(node, key.name);

const isStringValue = (node: TSESTree.Node) =>
  (node.type === 'Literal' && typeof node.value === 'string')
  || node.type === 'TemplateLiteral';

// `keys.includes(k)` / `set.has(k)` with a list that does not depend on the entry. A string
// receiver (`'abc'.includes(k)`) tests substrings.
const isKeyLookup = (context: Context, node: TSESTree.Node) => {
  if (
    node.type !== 'CallExpression'
    || node.optional
    || node.arguments.length !== 1
    || node.callee.type !== 'MemberExpression'
    || node.callee.computed
    || node.callee.optional
    || node.callee.property.type !== 'Identifier'
    || !/^(has|includes)$/.test(node.callee.property.name)
  )
    return false;
  const list = unwrapTypes(node.callee.object);
  return (
    isKeyParam(context, node.arguments[0])
    && !isStringValue(list)
    && isEntryIndependent(context, list)
  );
};

// `k === 'a'` / `'a' == k` (`operators` `===`/`==`), or the `!==`/`!=` counterpart.
const isKeyComparison = (
  context: Context,
  node: TSESTree.Node,
  operators: RegExp,
) =>
  node.type === 'BinaryExpression'
  && operators.test(node.operator)
  && ((isKeyParam(context, node.left)
    && isEntryIndependent(context, node.right))
    || (isKeyParam(context, node.right)
      && isEntryIndependent(context, node.left)));

// The predicate keeps exactly the keys of a fixed list: `keys.includes(k)`,
// `k === 'a' || k === 'b'`.
const isKeyMembership = (context: Context, node: TSESTree.Node): boolean =>
  node.type === 'LogicalExpression' && node.operator === '||'
    ? isKeyMembership(context, node.left)
      && isKeyMembership(context, node.right)
    : isKeyLookup(context, node) || isKeyComparison(context, node, /^==?=$/);

const isNegation = (node: TSESTree.Node): node is TSESTree.UnaryExpression =>
  node.type === 'UnaryExpression' && node.operator === '!';

// The predicate drops exactly the keys of a fixed list: `!keys.includes(k)`,
// `k !== 'a' && k !== 'b'`.
const isKeyExclusion = (context: Context, node: TSESTree.Node): boolean =>
  node.type === 'LogicalExpression' && node.operator === '&&'
    ? isKeyExclusion(context, node.left) && isKeyExclusion(context, node.right)
    : (isNegation(node) && isKeyMembership(context, node.argument))
      || isKeyComparison(context, node, /^!==?$/);

// `!pred`, or a conjunction of negations (`!a && k !== 'x'`, which is `!(a || k === 'x')`).
// `!!v` is a truthiness test, not a negated predicate.
const isNegatedPredicate = (context: Context, node: TSESTree.Node): boolean =>
  node.type === 'LogicalExpression' && node.operator === '&&'
    ? isNegatedPredicate(context, node.left)
      && isNegatedPredicate(context, node.right)
    : (isNegation(node) && !isNegation(node.argument))
      || isKeyComparison(context, node, /^!==?$/);

// How a `fromEntriesOfFilteredEntries` match selects its entries, or null when the callback
// is not a predicate over a destructured `[k, v]` entry.
export const entryFilter = (
  sourceCode: SourceCode,
  fromEntries: TSESTree.CallExpression,
): EntryFilter | null => {
  const callback = frameCallback(fromEntries);
  const params = entryParams(callback);
  const predicate = returnedExpression(callback.body);
  if (
    !params
    || !predicate
    || !referencesParam(sourceCode, callback, predicate)
  )
    return null;
  const context = { sourceCode, callback, key: params.key };
  if (isKeyExclusion(context, predicate)) return 'omit';
  if (isKeyMembership(context, predicate)) return 'pick';
  return isNegatedPredicate(context, predicate) ? 'omitBy' : 'pickBy';
};
