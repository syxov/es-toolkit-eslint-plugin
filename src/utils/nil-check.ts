import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, isLiteralValue, isSameExpression } from './ast.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Side = 'left' | 'right';

// Selector fragments. esquery compares attribute values as strings (and a missing property
// as "undefined"), so literals are matched by `type` plus `raw`, never by `value` alone.
export const nullLiteral = (side: Side) =>
  `[${side}.type="Literal"][${side}.raw="null"]`;

export const undefinedValue = (side: Side) =>
  `:matches([${side}.type="Identifier"][${side}.name="undefined"], [${side}.operator="void"][${side}.argument.type="Literal"][${side}.argument.raw="0"])`;

const typeofUndefinedOn = (typeofSide: Side, literalSide: Side) =>
  `[${typeofSide}.type="UnaryExpression"][${typeofSide}.operator="typeof"][${literalSide}.type="Literal"][${literalSide}.value="undefined"]`;

// `typeof x === 'undefined'` with any equality operator, in either operand order.
export const typeofUndefined = `BinaryExpression[operator=/^[!=]==?$/]:matches(${typeofUndefinedOn('left', 'right')}, ${typeofUndefinedOn('right', 'left')})`;

interface NilComparison {
  kind: 'null' | 'undefined';
  negated: boolean;
  strict: boolean;
  value: TSESTree.Node;
}

const isNull = (node: TSESTree.Node) =>
  node.type === 'Literal' && node.raw === 'null';

const isUndefined = (node: TSESTree.Node) =>
  isIdentifierNamed(node, 'undefined')
  || (node.type === 'UnaryExpression'
    && node.operator === 'void'
    && node.argument.type === 'Literal'
    && node.argument.raw === '0');

const isTypeof = (node: TSESTree.Node): node is TSESTree.UnaryExpression =>
  node.type === 'UnaryExpression' && node.operator === 'typeof';

const parseNilComparison = (node: TSESTree.Node): NilComparison | undefined => {
  if (node.type !== 'BinaryExpression' || !/^[!=]==?$/.test(node.operator))
    return undefined;
  const { left, right, operator } = node;
  const negated = operator.startsWith('!');
  const strict = operator.length === 3;
  if (isNull(right)) return { kind: 'null', negated, strict, value: left };
  if (isNull(left)) return { kind: 'null', negated, strict, value: right };
  if (isUndefined(right))
    return { kind: 'undefined', negated, strict, value: left };
  if (isUndefined(left))
    return { kind: 'undefined', negated, strict, value: right };
  // `typeof` always yields a string, so `==` behaves like `===` here.
  if (isTypeof(left) && isLiteralValue(right, 'undefined'))
    return { kind: 'undefined', negated, strict: true, value: left.argument };
  if (isTypeof(right) && isLiteralValue(left, 'undefined'))
    return { kind: 'undefined', negated, strict: true, value: right.argument };
  return undefined;
};

// `x === null || x === undefined` (negated: `x !== null && x !== undefined`), any order.
const isNilPair = (
  sourceCode: SourceCode,
  operator: TSESTree.LogicalExpression['operator'],
  a: TSESTree.Node,
  b: TSESTree.Node,
) => {
  const first = parseNilComparison(a);
  const second = parseNilComparison(b);
  const negated = operator === '&&';
  if (operator === '??' || !first || !second) return false;
  return (
    first.kind !== second.kind
    && [first, second].every(c => c.strict && c.negated === negated)
    && isSameExpression(sourceCode, first.value, second.value)
  );
};

// In `a || b || c` (parsed as `(a || b) || c`) the operand next to `c` is `b`.
const lastOperand = (
  node: TSESTree.Node,
  operator: TSESTree.LogicalExpression['operator'],
) =>
  node.type === 'LogicalExpression' && node.operator === operator
    ? node.right
    : node;

// The pair ending at `node.right`, so every adjacent pair of a chain is found exactly once.
export const nilPairIn = (
  sourceCode: SourceCode,
  node: TSESTree.LogicalExpression,
): TSESTree.SourceLocation | undefined => {
  const left = lastOperand(node.left, node.operator);
  return isNilPair(sourceCode, node.operator, left, node.right)
    ? { start: left.loc.start, end: node.right.loc.end }
    : undefined;
};

// The comparison is one half of a nil pair, which prefer-is-nil / prefer-is-not-nil report.
export const isNilPairHalf = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
): boolean => {
  const { parent } = node;
  if (parent?.type !== 'LogicalExpression') return false;
  const { operator } = parent;
  if (parent.left === node)
    return isNilPair(sourceCode, operator, node, parent.right);
  if (isNilPair(sourceCode, operator, lastOperand(parent.left, operator), node))
    return true;
  const outer = parent.parent;
  return (
    outer.type === 'LogicalExpression'
    && outer.operator === operator
    && outer.left === parent
    && isNilPair(sourceCode, operator, node, outer.right)
  );
};

// `arr.filter(x => x !== null)` is `without(arr, null)`, which prefer-without reports.
export const isWithoutPredicate = (node: TSESTree.BinaryExpression) => {
  const arrow = node.parent;
  if (
    node.operator !== '!=='
    || arrow.type !== 'ArrowFunctionExpression'
    || arrow.body !== node
    || arrow.params.length !== 1
  )
    return false;
  const [param] = arrow.params;
  const call = arrow.parent;
  return (
    param.type === 'Identifier'
    && (isIdentifierNamed(node.left, param.name)
      || isIdentifierNamed(node.right, param.name))
    && call.type === 'CallExpression'
    && call.arguments.length === 1
    && call.arguments[0] === arrow
    && call.callee.type === 'MemberExpression'
    && isIdentifierNamed(call.callee.property, 'filter')
  );
};
