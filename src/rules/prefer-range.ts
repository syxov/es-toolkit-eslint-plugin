import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

// Selector fragments take an attribute path prefix: '' for the matched node itself,
// or e.g. 'callee.object.' for its `.map` receiver.
type Path = '' | `${string}.`;

// `Array(n)` or `new Array(n)`.
const sizedArray = (p: Path) =>
  `[${p}type=/^(Call|New)Expression$/][${p}callee.name="Array"][${p}arguments.length=1]`;

// `Array.from({ length: n }, …)` with `count` arguments.
const arrayFromLength = (p: Path, count: '1' | '2') =>
  `[${p}callee.object.name="Array"][${p}callee.property.name="from"][${p}arguments.length=${count}][${p}arguments.0.type="ObjectExpression"][${p}arguments.0.properties.0.key.name="length"]`;

// `[...Array(n).keys()]` — a spread of the index iterator of a freshly sized array.
const spreadArrayKeys =
  'ArrayExpression[elements.length=1][elements.0.type="SpreadElement"][elements.0.argument.type="CallExpression"][elements.0.argument.callee.property.name="keys"][elements.0.argument.callee.object.callee.name="Array"]';

// `Array.from({ length: n }, (_, i) => i)`; the mapper is checked in JS.
const arrayFromMapped = `CallExpression${arrayFromLength('', '2')}`;

// `<n slots>.map((_, i) => i)` where the receiver is `Array.from({ length: n })`,
// `[...Array(n)]` or `Array(n).fill(v)` (a partial `fill(v, start)` would leave holes).
const r = 'callee.object.';
const fromLengthReceiver = arrayFromLength(r, '1');
const spreadReceiver = `[${r}type="ArrayExpression"][${r}elements.length=1][${r}elements.0.type="SpreadElement"]${sizedArray(`${r}elements.0.argument.`)}`;
const fillReceiver = `[${r}callee.property.name="fill"][${r}arguments.length<2]${sizedArray(`${r}callee.object.`)}`;
const mappedSizedArray = `CallExpression[callee.property.name="map"][arguments.length=1]:matches(${fromLengthReceiver}, ${spreadReceiver}, ${fillReceiver})`;

// The expression body, or the argument of a body made of a single `return`.
const returnedExpression = (
  body: TSESTree.BlockStatement | TSESTree.Expression,
) => {
  if (body.type !== 'BlockStatement') return body;
  const [statement] = body.body;
  return body.body.length === 1 && statement.type === 'ReturnStatement'
    ? statement.argument
    : null;
};

// `(_, i) => i`, `(_, i) => { return i; }` or `function (_, i) { return i; }`.
const returnsIndexParam = (mapper: TSESTree.CallExpressionArgument) => {
  if (
    mapper.type !== 'ArrowFunctionExpression'
    && mapper.type !== 'FunctionExpression'
  )
    return false;
  const [, index] = mapper.params;
  if (mapper.params.length !== 2 || index.type !== 'Identifier') return false;
  const returned = returnedExpression(mapper.body);
  return returned != null && isIdentifierNamed(returned, index.name);
};

export const preferRange = createRule({
  name: 'prefer-range',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `range` from es-toolkit instead of manual index-array construction.',
    },
    schema: [],
    messages: {
      preferRange:
        'Prefer `range` from es-toolkit instead of building an index array by hand.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferRange' });

    return {
      [spreadArrayKeys]: report,
      [arrayFromMapped](node: TSESTree.CallExpression) {
        if (returnsIndexParam(node.arguments[1])) report(node);
      },
      [mappedSizedArray](node: TSESTree.CallExpression) {
        if (returnsIndexParam(node.arguments[0])) report(node);
      },
    };
  },
});
