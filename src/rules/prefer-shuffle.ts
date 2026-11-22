import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// Every helper takes the attribute path of the node it describes, so a whole comparator
// shape is checked on the sort call itself.
const mathRandomCall = (path: string) =>
  `[${path}.type="CallExpression"][${path}.callee.type="MemberExpression"][${path}.callee.computed=false][${path}.callee.object.name="Math"][${path}.callee.property.name="random"][${path}.arguments.length=0]`;

// esquery compares values as strings, so `.5` matches and the string literal `'0.5'` is excluded by raw.
const half = (path: string) =>
  `[${path}.type="Literal"][${path}.value=0.5]:not([${path}.raw=/^["']/])`;

const one = (path: string) => `[${path}.type="Literal"][${path}.raw="1"]`;

const minusOne = (path: string) =>
  `[${path}.type="UnaryExpression"][${path}.operator="-"]${one(`${path}.argument`)}`;

const randomAndHalf = (path: string) =>
  `:matches(${mathRandomCall(`${path}.left`)}${half(`${path}.right`)}, ${half(`${path}.left`)}${mathRandomCall(`${path}.right`)})`;

// `Math.random() - 0.5` / `0.5 - Math.random()`.
const randomMinusHalf = (path: string) =>
  `[${path}.type="BinaryExpression"][${path}.operator="-"]${randomAndHalf(path)}`;

// `Math.random() > 0.5 ? 1 : -1`, with any comparison direction and branch order.
const coinFlip = (path: string) =>
  `[${path}.type="ConditionalExpression"][${path}.test.type="BinaryExpression"][${path}.test.operator=/^[<>]=?$/]${randomAndHalf(`${path}.test`)}:matches(${one(`${path}.consequent`)}${minusOne(`${path}.alternate`)}, ${minusOne(`${path}.consequent`)}${one(`${path}.alternate`)})`;

const randomSign = (path: string) =>
  `:matches(${randomMinusHalf(path)}, ${coinFlip(path)})`;

// The comparator returns only `Math.random()` and literals, so it cannot read its params.
const sortCall =
  'CallExpression[callee.type="MemberExpression"][callee.property.name=/^(sort|toSorted)$/][arguments.length=1][arguments.0.async=false][arguments.0.generator=false]';

const expressionBodyComparator = `${sortCall}[arguments.0.type="ArrowFunctionExpression"]${randomSign('arguments.0.body')}`;

const singleReturnComparator = `${sortCall}[arguments.0.type=/^(ArrowFunctionExpression|FunctionExpression)$/][arguments.0.body.type="BlockStatement"][arguments.0.body.body.length=1][arguments.0.body.body.0.type="ReturnStatement"]${randomSign('arguments.0.body.body.0.argument')}`;

export const preferShuffle = createRule({
  name: 'prefer-shuffle',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `shuffle` from es-toolkit instead of sorting with a random comparator.',
    },
    schema: [],
    messages: {
      preferShuffle:
        'Prefer `shuffle` from es-toolkit instead of sorting with a random comparator.',
    },
  },
  create(context) {
    const report = (node: TSESTree.CallExpression) =>
      context.report({ node, messageId: 'preferShuffle' });

    return {
      [expressionBodyComparator]: report,
      [singleReturnComparator]: report,
    };
  },
});
