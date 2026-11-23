import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, isLiteralValue } from './ast.js';
import { isNonArrayReceiver } from './non-array-receiver.js';
import { isOptionalCall } from './optional-chain.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Callback = TSESTree.ArrowFunctionExpression & {
  params: [TSESTree.Identifier];
};

// `differenceBy` when both sides apply the same mapping, `differenceWith` for any other
// equality between the two elements.
export type DifferenceKind = 'by' | 'with';

interface Frame {
  sourceCode: SourceCode;
  outer: Callback;
  inner: Callback;
  outerRefs: Set<TSESTree.Node>;
  innerRefs: Set<TSESTree.Node>;
}

// The identifiers that read the callback's only parameter.
const paramReferences = (sourceCode: SourceCode, fn: Callback) =>
  new Set<TSESTree.Node>(
    sourceCode
      .getDeclaredVariables(fn)
      .flatMap(variable => variable.references.map(ref => ref.identifier)),
  );

const reads = (refs: Set<TSESTree.Node>, node: TSESTree.Node) =>
  [...refs].some(
    ref => ref.range[0] >= node.range[0] && ref.range[1] <= node.range[1],
  );

const isSingleParamArrow = (node: TSESTree.Node): node is Callback =>
  node.type === 'ArrowFunctionExpression'
  && node.params.length === 1
  && node.params[0].type === 'Identifier'
  && node.body.type !== 'BlockStatement';

// `b.some(cb)`, `b.every(cb)`, `b.findIndex(cb)`: one arrow callback, no optional link.
const scanCall = (node: TSESTree.Node, method: string) =>
  node.type === 'CallExpression'
  && !node.optional
  && node.callee.type === 'MemberExpression'
  && !node.callee.optional
  && !node.callee.computed
  && isIdentifierNamed(node.callee.property, method)
  && node.arguments.length === 1
  && isSingleParamArrow(node.arguments[0])
    ? { receiver: node.callee.object, callback: node.arguments[0] }
    : undefined;

const isMinusOne = (node: TSESTree.Node) =>
  node.type === 'UnaryExpression'
  && node.operator === '-'
  && isLiteralValue(node.argument, 1);

// `b.findIndex(cb) === -1`, `-1 === b.findIndex(cb)`, `b.findIndex(cb) < 0`.
const missingIndexScan = (body: TSESTree.Expression) => {
  if (body.type !== 'BinaryExpression') return undefined;
  if (body.operator === '===' || body.operator === '==')
    return isMinusOne(body.right)
      ? scanCall(body.left, 'findIndex')
      : isMinusOne(body.left)
        ? scanCall(body.right, 'findIndex')
        : undefined;
  return body.operator === '<' && isLiteralValue(body.right, 0)
    ? scanCall(body.left, 'findIndex')
    : undefined;
};

// The two expressions are the same mapping of their own parameter: `y.id` and `x.id`,
// `String(y)` and `String(x)`. Tokens match one for one, and a parameter read on one side
// faces a parameter read on the other.
const isSameMapping = (
  { sourceCode, innerRefs, outerRefs }: Frame,
  ySide: TSESTree.Node,
  xSide: TSESTree.Node,
) => {
  const yTokens = sourceCode.getTokens(ySide);
  const xTokens = sourceCode.getTokens(xSide);
  const starts = (refs: Set<TSESTree.Node>) =>
    new Set([...refs].map(ref => ref.range[0]));
  const yStarts = starts(innerRefs);
  const xStarts = starts(outerRefs);
  return (
    yTokens.length === xTokens.length
    && yTokens.every((yToken, i) => {
      const xToken = xTokens[i];
      const yIsParam = yStarts.has(yToken.range[0]);
      if (yIsParam !== xStarts.has(xToken.range[0])) return false;
      return (
        yIsParam
        || (yToken.type === xToken.type && yToken.value === xToken.value)
      );
    })
  );
};

const isParam = (node: TSESTree.Node, fn: Callback) =>
  isIdentifierNamed(node, fn.params[0].name);

// `a === b` / `a == b` (or the negated operators) with one side reading only `x` and the
// other only `y`.
const equalityKind = (
  frame: Frame,
  node: TSESTree.BinaryExpression,
): DifferenceKind | undefined => {
  const { left, right } = node;
  if (left.type === 'PrivateIdentifier') return undefined;
  const side = (expression: TSESTree.Node) => {
    const x = reads(frame.outerRefs, expression);
    const y = reads(frame.innerRefs, expression);
    return x === y ? undefined : x ? 'x' : 'y';
  };
  const leftSide = side(left);
  const rightSide = side(right);
  if (!leftSide || !rightSide || leftSide === rightSide) return undefined;
  const [xSide, ySide] = leftSide === 'x' ? [left, right] : [right, left];
  // `y === x` compares the elements themselves: `difference`.
  if (isParam(xSide, frame.outer) && isParam(ySide, frame.inner))
    return undefined;
  return node.operator.length === 3 && isSameMapping(frame, ySide, xSide)
    ? 'by'
    : 'with';
};

const equalityMethod = /^(equals?|isEqual|isSame)$/;

// `isEqual(x, y)`, `isEqual(y, x)`, `x.equals(y)`.
const isComparatorCall = (
  { outer, inner, outerRefs, innerRefs }: Frame,
  node: TSESTree.CallExpression,
) => {
  if (node.optional) return false;
  const { callee, arguments: args } = node;
  const isPair = (a: TSESTree.Node, b: TSESTree.Node) =>
    (isParam(a, outer) && isParam(b, inner))
    || (isParam(a, inner) && isParam(b, outer));
  if (args.length === 2)
    return (
      isPair(args[0], args[1])
      && !reads(outerRefs, callee)
      && !reads(innerRefs, callee)
    );
  return (
    args.length === 1
    && callee.type === 'MemberExpression'
    && !callee.computed
    && !callee.optional
    && callee.property.type === 'Identifier'
    && equalityMethod.test(callee.property.name)
    && isPair(callee.object, args[0])
  );
};

// The inner callback body when it says "`y` equals `x`".
const matchKind = (
  frame: Frame,
  node: TSESTree.Expression,
): DifferenceKind | undefined => {
  switch (node.type) {
    case 'BinaryExpression':
      return node.operator === '===' || node.operator === '=='
        ? equalityKind(frame, node)
        : undefined;
    case 'CallExpression':
      return isComparatorCall(frame, node) ? 'with' : undefined;
    case 'LogicalExpression':
      return node.operator === '&&'
        && matchKind(frame, node.left)
        && matchKind(frame, node.right)
        ? 'with'
        : undefined;
    default:
      return undefined;
  }
};

// The inner `every` callback body when it says "`y` differs from `x`".
const mismatchKind = (
  frame: Frame,
  node: TSESTree.Expression,
): DifferenceKind | undefined => {
  if (node.type === 'UnaryExpression' && node.operator === '!')
    return matchKind(frame, node.argument);
  return node.type === 'BinaryExpression'
    && (node.operator === '!==' || node.operator === '!=')
    ? equalityKind(frame, node)
    : undefined;
};

// `a.filter(x => !b.some(y => …))`, `a.filter(x => b.every(y => …))` or
// `a.filter(x => b.findIndex(y => …) === -1)` keeping the elements of `a` that match none of
// `b`. The second array must not depend on `x`, and the inner callback must compare the two
// elements.
export const differenceFilterKind = (
  sourceCode: SourceCode,
  filter: TSESTree.CallExpression,
): DifferenceKind | undefined => {
  const outer = filter.arguments[0];
  if (
    filter.callee.type !== 'MemberExpression'
    || !isSingleParamArrow(outer)
    || isOptionalCall(filter)
  )
    return undefined;
  const body = outer.body as TSESTree.Expression;
  const negatedSome =
    body.type === 'UnaryExpression' && body.operator === '!'
      ? scanCall(body.argument, 'some')
      : undefined;
  const every = scanCall(body, 'every');
  const scan = negatedSome ?? every ?? missingIndexScan(body);
  if (!scan) return undefined;

  const outerRefs = paramReferences(sourceCode, outer);
  if (
    reads(outerRefs, scan.receiver)
    || isNonArrayReceiver(sourceCode, filter.callee.object)
    || isNonArrayReceiver(sourceCode, scan.receiver)
  )
    return undefined;
  const frame: Frame = {
    sourceCode,
    outer,
    inner: scan.callback,
    outerRefs,
    innerRefs: paramReferences(sourceCode, scan.callback),
  };
  const innerBody = scan.callback.body as TSESTree.Expression;
  return scan === every
    ? mismatchKind(frame, innerBody)
    : matchKind(frame, innerBody);
};
