import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

type MathMethod = 'min' | 'max';
type MathCall = TSESTree.CallExpression & {
  callee: TSESTree.MemberExpression & { property: TSESTree.Identifier };
  arguments: [TSESTree.CallExpressionArgument, TSESTree.CallExpressionArgument];
};

const mathCall = (method: string) =>
  `CallExpression[callee.object.name="Math"][callee.property.name=${method}][arguments.length=2]`;

// A clamp is an outer Math call wrapping the opposite Math call as exactly one direct argument:
// Math.min(Math.max(value, lower), upper) or Math.max(Math.min(value, upper), lower).
// With both arguments wrapped (`Math.max(Math.min(a, b), Math.min(c, d))`) it is a symmetric
// min/max such as an interval-overlap test, and is not equivalent to `clamp` when lower > upper.
const clampPattern = (outer: MathMethod, inner: MathMethod) =>
  `${mathCall(`"${outer}"`)}:has(> ${mathCall(`"${inner}"`)}):not(:has(> ${mathCall(`"${inner}"`)} ~ ${mathCall(`"${inner}"`)}))`;

const methodOf = (call: MathCall) => call.callee.property.name;

const isMathCall = (node: TSESTree.Node, method: string): node is MathCall =>
  node.type === 'CallExpression'
  && node.arguments.length === 2
  && node.callee.type === 'MemberExpression'
  && node.callee.object.type === 'Identifier'
  && node.callee.object.name === 'Math'
  && node.callee.property.type === 'Identifier'
  && node.callee.property.name === method;

const wrappedCall = (clamp: MathCall) => {
  const inner = methodOf(clamp) === 'min' ? 'max' : 'min';
  return clamp.arguments.find((arg): arg is MathCall => isMathCall(arg, inner));
};

// `Math.max(0, xs.length - 1)`: the last index of a possibly empty list. Bounding an index by
// it (`Math.min(i, Math.max(0, xs.length - 1))`) is not `clamp(i, 0, xs.length - 1)`, which
// returns -1 for an empty list.
const isLastIndexBound = (call: MathCall) =>
  call.arguments.some(arg => arg.type === 'Literal' && arg.raw === '0')
  && call.arguments.some(
    arg =>
      arg.type === 'BinaryExpression'
      && arg.operator === '-'
      && arg.left.type === 'MemberExpression'
      && arg.left.property.type === 'Identifier'
      && arg.left.property.name === 'length'
      && arg.right.type === 'Literal'
      && arg.right.raw === '1',
  );

const enclosingFunction = (node: TSESTree.Node): TSESTree.Node => {
  let current = node;
  while (current.parent && !current.type.includes('Function'))
    current = current.parent;
  return current;
};

const contains = (outer: TSESTree.Node, inner: TSESTree.Node) =>
  outer.range[0] <= inner.range[0] && inner.range[1] <= outer.range[1];

export const preferClamp = createRule({
  name: 'prefer-clamp',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `clamp` from es-toolkit instead of nested `Math.min`/`Math.max`.',
    },
    schema: [],
    messages: {
      preferClamp:
        'Prefer `clamp` from es-toolkit instead of nesting `Math.min`/`Math.max`.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const mathCalls: MathCall[] = [];
    const clamps: MathCall[] = [];

    // Interval normalisation orders a pair before bounding it: `Math.max(Math.min(a, b), lo)`
    // next to `Math.min(Math.max(a, b), hi)`. The mirrored `Math.<outer>(a, b)` in the same
    // function gives it away; such code relies on what happens when the bounds cross.
    const isIntervalBound = (
      clamp: MathCall,
      [p, q]: MathCall['arguments'],
    ) => {
      const scope = enclosingFunction(clamp);
      return mathCalls.some(
        call =>
          call !== clamp
          && methodOf(call) === methodOf(clamp)
          && contains(scope, call)
          && ((isSameExpression(sourceCode, call.arguments[0], p)
            && isSameExpression(sourceCode, call.arguments[1], q))
            || (isSameExpression(sourceCode, call.arguments[0], q)
              && isSameExpression(sourceCode, call.arguments[1], p))),
      );
    };

    const reported = new Set<TSESTree.Node>();
    const check = (clamp: MathCall) => {
      const inner = wrappedCall(clamp);
      if (
        !inner
        // Report a clamp nested in another reported clamp once, at the outer one.
        || reported.has(clamp.parent)
        || (methodOf(clamp) === 'min' && isLastIndexBound(inner))
        || isIntervalBound(clamp, inner.arguments)
      )
        return;
      reported.add(clamp);
      context.report({ node: clamp, messageId: 'preferClamp' });
    };

    return {
      [mathCall('/^(min|max)$/')]: (node: MathCall) => mathCalls.push(node),
      [clampPattern('min', 'max')]: (node: MathCall) => clamps.push(node),
      [clampPattern('max', 'min')]: (node: MathCall) => clamps.push(node),
      // The mirrored call may come later in the function, so decide once all are collected.
      'Program:exit': () => clamps.forEach(check),
    };
  },
});
