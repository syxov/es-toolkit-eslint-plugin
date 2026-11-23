import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { isSampleIndex } from '../utils/is-sample-index.js';
import { someDescendant } from '../utils/some-descendant.js';

const random =
  'CallExpression[callee.object.name="Math"][callee.property.name="random"]';

// `Math.random() * X` or `X * Math.random()`.
const product = `BinaryExpression[operator="*"]:has(> ${random})`;

// Each idiom truncates that product to an int: `Math.floor`/`Math.trunc`, `~~`, or `| 0`.
const truncCall = `CallExpression[callee.object.name="Math"][callee.property.name=/^(floor|trunc)$/][arguments.length=1]:has(> ${product})`;
const doubleTilde = `UnaryExpression[operator="~"]:has(> UnaryExpression[operator="~"]:has(> ${product}))`;
// `raw` rather than `value`: esquery compares values as strings, so `| '0'` would match too.
const bitwiseOr = `BinaryExpression[operator="|"][right.type="Literal"][right.raw="0"]:has(> ${product})`;

type Loop =
  | TSESTree.DoWhileStatement
  | TSESTree.ForInStatement
  | TSESTree.ForOfStatement
  | TSESTree.ForStatement
  | TSESTree.WhileStatement;

const isLoop = (node: TSESTree.Node): node is Loop =>
  node.type === 'DoWhileStatement'
  || node.type === 'ForInStatement'
  || node.type === 'ForOfStatement'
  || node.type === 'ForStatement'
  || node.type === 'WhileStatement';

// The loop the node sits in, without crossing a function boundary.
const enclosingLoop = (node: TSESTree.Node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type.includes('Function')) return undefined;
    if (isLoop(current)) return current;
  }
  return undefined;
};

export const preferRandomInt = createRule({
  name: 'prefer-random-int',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `randomInt` from es-toolkit instead of truncating `Math.random() * …` to an int.',
    },
    schema: [],
    messages: {
      preferRandomInt:
        'Prefer `randomInt` from es-toolkit instead of truncating `Math.random() * …` to an int.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const same = (a: TSESTree.Node | null, b: TSESTree.Node | null) =>
      a !== null && b !== null && isSameExpression(sourceCode, a, b);

    // `[a[i], a[j]] = [a[j], a[i]]`, or the `a[i] = a[j]` step of a temp-variable swap.
    const isSwap = (node: TSESTree.Node) => {
      if (node.type !== 'AssignmentExpression' || node.operator !== '=')
        return false;
      const { left, right } = node;
      if (left.type === 'ArrayPattern' && right.type === 'ArrayExpression')
        return (
          left.elements.length === 2
          && right.elements.length === 2
          && same(left.elements[0], right.elements[1])
          && same(left.elements[1], right.elements[0])
        );
      return (
        left.type === 'MemberExpression'
        && left.computed
        && right.type === 'MemberExpression'
        && right.computed
        && same(left.object, right.object)
        && !same(left.property, right.property)
      );
    };

    // A Fisher–Yates shuffle draws its swap index in the loop: `shuffle` is the utility.
    const isShuffleIndex = (node: TSESTree.Node) => {
      const loop = enclosingLoop(node);
      return (
        loop !== undefined && someDescendant(sourceCode, loop.body, isSwap)
      );
    };

    const report = (node: TSESTree.Node) => {
      const { parent } = node;
      // `arr[Math.floor(Math.random() * arr.length)]` is reported by prefer-sample.
      if (
        parent?.type === 'MemberExpression'
        && parent.property === node
        && isSampleIndex(context.sourceCode, parent)
      )
        return;
      if (isShuffleIndex(node)) return;
      context.report({ node, messageId: 'preferRandomInt' });
    };

    return {
      [truncCall]: report,
      [doubleTilde]: report,
      [bitwiseOr]: report,
    };
  },
});
