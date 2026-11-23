import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, isLiteralValue, isSameExpression } from './ast.js';
import { isExcludedPredicateSite } from './predicate-site.js';
import { isUndeclaredIdentifier } from './scope.js';
import {
  conditionTests,
  isTypeDispatch,
  parseTypeTest,
  typeofComparison,
} from './type-test.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Side = 'left' | 'right';

// Selector fragments. esquery compares attribute values as strings (and a missing property
// as "undefined"), so literals are matched by `type` plus `raw`, never by `value` alone.
export const nullLiteral = (side: Side) =>
  `[${side}.type="Literal"][${side}.raw="null"]`;

export const undefinedValue = (side: Side) =>
  `:matches([${side}.type="Identifier"][${side}.name="undefined"], [${side}.operator="void"][${side}.argument.type="Literal"][${side}.argument.raw="0"])`;

export const typeofUndefined = typeofComparison('undefined');

interface NilComparison {
  kind: 'null' | 'undefined';
  negated: boolean;
  strict: boolean;
  value: TSESTree.Node;
  viaTypeof: boolean;
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
  const viaTypeof = false;
  if (isNull(right))
    return { kind: 'null', negated, strict, value: left, viaTypeof };
  if (isNull(left))
    return { kind: 'null', negated, strict, value: right, viaTypeof };
  if (isUndefined(right))
    return { kind: 'undefined', negated, strict, value: left, viaTypeof };
  if (isUndefined(left))
    return { kind: 'undefined', negated, strict, value: right, viaTypeof };
  // `typeof` always yields a string, so `==` behaves like `===` here.
  const typeofUndefined = { kind: 'undefined', negated, strict: true } as const;
  if (isTypeof(left) && isLiteralValue(right, 'undefined'))
    return { ...typeofUndefined, value: left.argument, viaTypeof: true };
  if (isTypeof(right) && isLiteralValue(left, 'undefined'))
    return { ...typeofUndefined, value: right.argument, viaTypeof: true };
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

interface NilCheck {
  // The comparison, or the `||` / `&&` of a pair when the pair is the whole expression.
  node: TSESTree.Node;
  value: TSESTree.Node;
  negated: boolean;
  viaTypeof: boolean;
}

// `typeof x === 'object' && x !== null`, `x != null && 'k' in x`: the null check is part of an
// object probe (`isObjectLike`), not a check of its own. On `unknown` values `isNotNil` would
// not even narrow for the probe that follows.
const probesObject = (sourceCode: SourceCode, { node, value }: NilCheck) =>
  conditionTests(node).some(test => {
    const typeTest = parseTypeTest(test);
    const probed =
      typeTest?.type === 'typeof object' || typeTest?.type === 'typeof function'
        ? typeTest.value
        : test.type === 'BinaryExpression' && test.operator === 'in'
          ? test.right
          : undefined;
    return !!probed && isSameExpression(sourceCode, probed, value);
  });

// `x.y`, `x[0].z`, `x.f()`, `x?.y`: a member or call chain rooted at `value`.
const isAccessOn = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  value: TSESTree.Node,
): boolean => {
  const inner =
    node.type === 'MemberExpression'
      ? node.object
      : node.type === 'CallExpression'
        ? node.callee
        : node.type === 'ChainExpression' || node.type === 'TSNonNullExpression'
          ? node.expression
          : undefined;
  return (
    !!inner
    && (isSameExpression(sourceCode, inner, value)
      || isAccessOn(sourceCode, inner, value))
  );
};

// `x = d;` or `{ x = d; }`.
const assignsTo = (
  sourceCode: SourceCode,
  statement: TSESTree.Statement,
  value: TSESTree.Node,
) => {
  const single =
    statement.type !== 'BlockStatement'
      ? statement
      : statement.body.length === 1
        ? statement.body[0]
        : undefined;
  return (
    single?.type === 'ExpressionStatement'
    && single.expression.type === 'AssignmentExpression'
    && single.expression.operator === '='
    && isSameExpression(sourceCode, single.expression.left, value)
  );
};

// `x === undefined ? d : x` is `x ?? d`, `x == null ? undefined : x.y` is `x?.y` and
// `if (x == null) x = d` is `x ??= d`: the native operator is the rewrite, not a predicate.
const hasNativeShorthand = (
  sourceCode: SourceCode,
  { node, value, negated }: NilCheck,
) => {
  const { parent } = node;
  if (parent?.type === 'ConditionalExpression' && parent.test === node) {
    const [whenNil, otherwise] = negated
      ? [parent.alternate, parent.consequent]
      : [parent.consequent, parent.alternate];
    return (
      isSameExpression(sourceCode, otherwise, value)
      || ((isNull(whenNil) || isUndefined(whenNil))
        && isAccessOn(sourceCode, otherwise, value))
    );
  }
  return (
    !negated
    && parent?.type === 'IfStatement'
    && parent.test === node
    && !parent.alternate
    && assignsTo(sourceCode, parent.consequent, value)
  );
};

const isReplaceable = (
  sourceCode: SourceCode,
  check: NilCheck,
  helper: string,
) =>
  !isExcludedPredicateSite(sourceCode, check.node, helper)
  // `(m = re.exec(s)) !== null` reads better than `!isNull(m = re.exec(s))`.
  && check.value.type !== 'AssignmentExpression'
  // `isUndefined(window)` throws where `typeof window` does not.
  && !(check.viaTypeof && isUndeclaredIdentifier(sourceCode, check.value))
  && !isTypeDispatch(sourceCode, check.node)
  && !probesObject(sourceCode, check)
  && !hasNativeShorthand(sourceCode, check);

// A single comparison with `null` / `undefined` that `helper` can replace.
export const isReplaceableNilComparison = (
  sourceCode: SourceCode,
  node: TSESTree.BinaryExpression,
  helper: string,
) => {
  const comparison = parseNilComparison(node);
  return (
    !!comparison && isReplaceable(sourceCode, { ...comparison, node }, helper)
  );
};

// The pair ending at `node.right`, so every adjacent pair of a chain is found exactly once,
// when `helper` can replace it.
export const nilPairIn = (
  sourceCode: SourceCode,
  node: TSESTree.LogicalExpression,
  helper: string,
): TSESTree.SourceLocation | undefined => {
  const left = lastOperand(node.left, node.operator);
  const first = parseNilComparison(left);
  const second = parseNilComparison(node.right);
  if (
    !first
    || !second
    || !isNilPair(sourceCode, node.operator, left, node.right)
  )
    return undefined;
  const check = {
    node: left === node.left ? node : node.right,
    value: first.value,
    negated: first.negated,
    viaTypeof: first.viaTypeof || second.viaTypeof,
  };
  return isReplaceable(sourceCode, check, helper)
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
