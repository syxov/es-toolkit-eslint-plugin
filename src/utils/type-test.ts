import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from './ast.js';
import { isExcludedPredicateSite } from './predicate-site.js';
import { isUndeclaredIdentifier } from './scope.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Side = 'left' | 'right';

const typeofOn = (type: string, typeofSide: Side, literalSide: Side) =>
  `[${typeofSide}.type="UnaryExpression"][${typeofSide}.operator="typeof"][${literalSide}.type="Literal"][${literalSide}.value="${type}"]`;

// `typeof value === 'string'` with any equality operator, in either operand order: `typeof`
// always yields a string, so loose and strict (in)equality are equivalent.
export const typeofComparison = (type: string) =>
  `BinaryExpression[operator=/^[!=]==?$/]:matches(${typeofOn(type, 'left', 'right')}, ${typeofOn(type, 'right', 'left')})`;

const isTypeof = (node: TSESTree.Node): node is TSESTree.UnaryExpression =>
  node.type === 'UnaryExpression' && node.operator === 'typeof';

interface TypeTest {
  value: TSESTree.Node;
  type: string;
}

// `typeof x === 'string'` tests `x` against `typeof string`, `x instanceof Date` against
// `instanceof Date`.
export const parseTypeTest = (node: TSESTree.Node): TypeTest | undefined => {
  if (node.type !== 'BinaryExpression') return undefined;
  const { left, right, operator } = node;
  if (operator === 'instanceof')
    return right.type === 'Identifier'
      ? { value: left, type: `instanceof ${right.name}` }
      : undefined;
  if (!/^[!=]==?$/.test(operator)) return undefined;
  const [operand, literal] = isTypeof(left) ? [left, right] : [right, left];
  return isTypeof(operand)
    && literal.type === 'Literal'
    && typeof literal.value === 'string'
    ? { value: operand.argument, type: `typeof ${literal.value}` }
    : undefined;
};

const isTestCombinator = (node: TSESTree.Node) =>
  (node.type === 'LogicalExpression' && node.operator !== '??')
  || (node.type === 'UnaryExpression' && node.operator === '!');

// The whole condition `node` is part of: up through `&&`, `||` and `!`, then up a ternary
// chain (`a ? x : b ? y : z`) when the condition is a ternary test.
const conditionRoot = (node: TSESTree.Node) => {
  let root = node;
  while (root.parent && isTestCombinator(root.parent)) root = root.parent;
  while (
    root.parent?.type === 'ConditionalExpression'
    && (root.parent.test === root || root.type === 'ConditionalExpression')
  )
    root = root.parent;
  return root;
};

const logicalTests = (node: TSESTree.Node): TSESTree.Node[] => {
  if (node.type === 'LogicalExpression' && node.operator !== '??')
    return [...logicalTests(node.left), ...logicalTests(node.right)];
  if (node.type === 'UnaryExpression' && node.operator === '!')
    return logicalTests(node.argument);
  return [node];
};

const chainTests = (node: TSESTree.Node): TSESTree.Node[] =>
  node.type === 'ConditionalExpression'
    ? [
        ...logicalTests(node.test),
        ...[node.consequent, node.alternate].flatMap(branch =>
          branch.type === 'ConditionalExpression' ? chainTests(branch) : [],
        ),
      ]
    : logicalTests(node);

// The single tests of the condition `node` is part of: `a && !(b || c)` yields `a`, `b` and
// `c`; a ternary chain yields the tests of all its ternaries.
export const conditionTests = (node: TSESTree.Node) =>
  chainTests(conditionRoot(node));

// `typeof x === 'string' || typeof x === 'number'`, `x instanceof File || x instanceof Blob`:
// one value tested against several types in one condition, a dispatch no single helper names.
export const isTypeDispatch = (sourceCode: SourceCode, node: TSESTree.Node) => {
  const own = parseTypeTest(node);
  return (
    !!own
    && conditionTests(node).some(test => {
      const other = test === node ? undefined : parseTypeTest(test);
      return (
        !!other
        && other.type !== own.type
        && isSameExpression(sourceCode, other.value, own.value)
      );
    })
  );
};

// `typeof window` is the one read of an undeclared identifier that does not throw: feature
// detection, which `isFunction(window)` would turn into a ReferenceError.
const probesUndeclared = (
  sourceCode: SourceCode,
  node: TSESTree.BinaryExpression,
) =>
  [node.left, node.right].some(
    side => isTypeof(side) && isUndeclaredIdentifier(sourceCode, side.argument),
  );

// `typeof value === 'string'` or `value instanceof Date` that `helper` can replace.
export const isReplaceableTypeTest = (
  sourceCode: SourceCode,
  node: TSESTree.BinaryExpression,
  helper: string,
) =>
  !probesUndeclared(sourceCode, node)
  && !isTypeDispatch(sourceCode, node)
  && !isExcludedPredicateSite(sourceCode, node, helper);

// The single type tests a predicate rule reports, with the helper it suggests
// (`tests/type-test-helpers.test.ts` keeps this in step with the rules).
export const typeTestHelpers: Readonly<Partial<Record<string, string>>> = {
  'typeof boolean': 'isBoolean',
  'typeof function': 'isFunction',
  'typeof number': 'isNumber',
  'typeof string': 'isString',
  'typeof symbol': 'isSymbol',
  'instanceof ArrayBuffer': 'isArrayBuffer',
  'instanceof Blob': 'isBlob',
  'instanceof Date': 'isDate',
  'instanceof Error': 'isError',
  'instanceof File': 'isFile',
  'instanceof Map': 'isMap',
  'instanceof RegExp': 'isRegExp',
  'instanceof Set': 'isSet',
  'instanceof WeakMap': 'isWeakMap',
  'instanceof WeakSet': 'isWeakSet',
};

// One of the type predicate rules (`prefer-is-string`, `prefer-is-date`, …) reports `node`
// as a whole. Rules whose rewrite would wrap the test (`pickBy(o, v => typeof v === 'string')`)
// yield it, so the predicate helper is suggested first.
export const isReportedTypeTest = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) => {
  if (node.type !== 'BinaryExpression') return false;
  const test = parseTypeTest(node);
  const helper = test && typeTestHelpers[test.type];
  return !!helper && isReplaceableTypeTest(sourceCode, node, helper);
};
