import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  isIdentifierNamed,
  isLiteralValue,
  isSameExpression,
  referencesParam,
} from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { isNonArraySlice } from '../utils/non-array-receiver.js';
import { hasStringName } from '../utils/string-name.js';

type SourceCode = Readonly<TSESLint.SourceCode>;

// `for (let i = 0; i < xs.length; i += size)` (or `let i = 0, n = xs.length; i < n`); the body
// is checked in JS.
const chunkLoop =
  'ForStatement[init.type="VariableDeclaration"][init.kind="let"][init.declarations.0.id.type="Identifier"][init.declarations.0.init.type="Literal"][init.declarations.0.init.raw="0"][test.type="BinaryExpression"][test.operator="<"][test.left.type="Identifier"][update.type="AssignmentExpression"][update.left.type="Identifier"]';

// `Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => …)`; the mapper is checked in JS.
const chunkArrayFrom =
  'CallExpression[callee.type="MemberExpression"][callee.object.name="Array"][callee.property.name="from"][arguments.length=2][arguments.0.type="ObjectExpression"][arguments.0.properties.length=1][arguments.0.properties.0.type="Property"][arguments.0.properties.0.computed=false][arguments.0.properties.0.key.name="length"][arguments.0.properties.0.value.type="CallExpression"][arguments.0.properties.0.value.callee.object.name="Math"][arguments.0.properties.0.value.callee.property.name="ceil"][arguments.0.properties.0.value.arguments.length=1][arguments.0.properties.0.value.arguments.0.type="BinaryExpression"][arguments.0.properties.0.value.arguments.0.operator="/"][arguments.1.type="ArrowFunctionExpression"][arguments.1.params.length=2][arguments.1.params.1.type="Identifier"]';

type ChunkArrayFrom = TSESTree.CallExpression & {
  arguments: [
    TSESTree.ObjectExpression & {
      properties: [
        TSESTree.Property & {
          value: TSESTree.CallExpression & {
            arguments: [TSESTree.BinaryExpression];
          };
        },
      ];
    },
    TSESTree.ArrowFunctionExpression & {
      params: [TSESTree.Parameter, TSESTree.Identifier];
    },
  ];
};

// `xs.length` → `xs`.
const lengthOf = (node: TSESTree.Node) =>
  node.type === 'MemberExpression'
  && !node.computed
  && isIdentifierNamed(node.property, 'length')
    ? node.object
    : undefined;

// `size`, `3`: a step that a loop header can hold fixed.
const isStep = (node: TSESTree.Node) =>
  node.type === 'Identifier'
  || (node.type === 'Literal'
    && typeof node.value === 'number'
    && node.value > 0);

type Match = (node: TSESTree.Node) => boolean;

// `a <operator> b` or `b <operator> a`.
const isPair = (node: TSESTree.Node, operator: '+' | '*', a: Match, b: Match) =>
  node.type === 'BinaryExpression'
  && node.operator === operator
  && ((a(node.left) && b(node.right)) || (b(node.left) && a(node.right)));

// `receiver.slice(start, end)` with `end` checked by the caller.
const sliceOf = (
  sourceCode: SourceCode,
  node: TSESTree.Node | null | undefined,
  receiver: TSESTree.Node,
) =>
  node?.type === 'CallExpression'
  && !node.optional
  && node.callee.type === 'MemberExpression'
  && !node.callee.computed
  && !node.callee.optional
  && isIdentifierNamed(node.callee.property, 'slice')
  && node.arguments.length === 2
  && isSameExpression(sourceCode, node.callee.object, receiver)
  && !isNonArraySlice(sourceCode, node)
  && !hasStringName(receiver)
    ? (node.arguments as [TSESTree.Expression, TSESTree.Expression])
    : undefined;

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

const loopStatements = (body: TSESTree.Statement) =>
  body.type === 'BlockStatement' ? body.body : [body];

export const preferChunk = createRule({
  name: 'prefer-chunk',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `chunk` from es-toolkit instead of slicing an array into fixed-size pieces by hand.',
    },
    schema: [],
    messages: {
      preferChunk:
        'Prefer `chunk` from es-toolkit instead of slicing an array into fixed-size pieces by hand.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const same = (a: TSESTree.Node) => (b: TSESTree.Node) =>
      isSameExpression(sourceCode, a, b);
    const named = (name: string) => (node: TSESTree.Node) =>
      isIdentifierNamed(node, name);

    // `i += size` or `i = i + size`.
    const loopStep = (update: TSESTree.AssignmentExpression, index: string) => {
      if (update.operator === '+=') return update.right;
      const { right } = update;
      if (
        update.operator !== '='
        || right.type !== 'BinaryExpression'
        || right.operator !== '+'
      )
        return undefined;
      if (isIdentifierNamed(right.left, index)) return right.right;
      return isIdentifierNamed(right.right, index) ? right.left : undefined;
    };

    const checkLoop = (node: TSESTree.ForStatement) => {
      const init = node.init as TSESTree.VariableDeclaration;
      const test = node.test as TSESTree.BinaryExpression;
      const update = node.update as TSESTree.AssignmentExpression;
      const { declarations } = init;
      const [indexDeclarator, boundDeclarator] = declarations;
      const index = indexDeclarator.id as TSESTree.Identifier;
      if (
        declarations.length > 2
        || !isIdentifierNamed(test.left, index.name)
        || !isIdentifierNamed(update.left, index.name)
      )
        return;

      // `i < xs.length`, or `i < n` where `n = xs.length` is declared alongside `i`.
      let receiver: TSESTree.Node | undefined;
      if (declarations.length === 2) {
        if (
          boundDeclarator.id.type !== 'Identifier'
          || !isIdentifierNamed(test.right, boundDeclarator.id.name)
          || !boundDeclarator.init
        )
          return;
        receiver = lengthOf(boundDeclarator.init);
      } else receiver = lengthOf(test.right);
      const step = loopStep(update, index.name);
      if (!receiver || !step || !isStep(step)) return;

      const loopVariables = sourceCode.getDeclaredVariables(init);
      const readsLoopVariable = (expression: TSESTree.Node) =>
        loopVariables.some(variable =>
          variable.references.some(
            ({ identifier }) =>
              identifier.range[0] >= expression.range[0]
              && identifier.range[1] <= expression.range[1],
          ),
        );
      if (readsLoopVariable(receiver) || readsLoopVariable(step)) return;

      const isIndex = named(index.name);
      const isStepValue = same(step);
      const statements = loopStatements(node.body);
      // `const end = i + size;` before the push.
      let endName: string | undefined;
      if (statements.length === 2) {
        const [declaration] = statements;
        const declarator =
          declaration.type === 'VariableDeclaration'
          && declaration.declarations.length === 1
            ? declaration.declarations[0]
            : undefined;
        if (
          declarator?.id.type !== 'Identifier'
          || !declarator.init
          || !isPair(declarator.init, '+', isIndex, isStepValue)
        )
          return;
        endName = declarator.id.name;
      } else if (statements.length !== 1) return;

      const push = statements.at(-1);
      if (push?.type !== 'ExpressionStatement') return;
      const call = push.expression;
      if (
        call.type !== 'CallExpression'
        || call.optional
        || call.callee.type !== 'MemberExpression'
        || call.callee.computed
        || !isIdentifierNamed(call.callee.property, 'push')
        || call.arguments.length !== 1
        || readsLoopVariable(call.callee.object)
        || same(receiver)(call.callee.object)
      )
        return;
      const slice = sliceOf(sourceCode, call.arguments[0], receiver);
      if (!slice || !isIndex(slice[0])) return;
      const [, end] = slice;
      const isEnd = (candidate: TSESTree.Node) =>
        endName
          ? isIdentifierNamed(candidate, endName)
          : isPair(candidate, '+', isIndex, isStepValue);
      // `Math.min(i + size, xs.length)`: `slice` already clamps the end.
      const isClampedEnd =
        end.type === 'CallExpression'
        && end.callee.type === 'MemberExpression'
        && isIdentifierNamed(end.callee.object, 'Math')
        && isIdentifierNamed(end.callee.property, 'min')
        && end.arguments.length === 2
        && end.arguments.some(isEnd)
        && end.arguments.some(argument => {
          const object = lengthOf(argument);
          return object !== undefined && same(receiver)(object);
        });
      if (isEnd(end) || isClampedEnd)
        context.report({ node, messageId: 'preferChunk' });
    };

    return {
      [chunkLoop]: checkLoop,
      [chunkArrayFrom](node: ChunkArrayFrom) {
        const [length, mapper] = node.arguments;
        const quotient = length.properties[0].value.arguments[0];
        const receiver = lengthOf(quotient.left);
        const step = quotient.right;
        if (
          !receiver
          || !isStep(step)
          || referencesParam(sourceCode, mapper, receiver)
        )
          return;
        const isIndex = named(mapper.params[1].name);
        const isStepValue = same(step);
        const slice = sliceOf(
          sourceCode,
          returnedExpression(mapper.body),
          receiver,
        );
        if (!slice) return;
        const [start, end] = slice;
        if (!isPair(start, '*', isIndex, isStepValue)) return;
        const isNextIndex = (candidate: TSESTree.Node) =>
          isPair(candidate, '+', isIndex, one => isLiteralValue(one, 1));
        // `i * size + size` or `(i + 1) * size`.
        if (
          isPair(end, '+', same(start), isStepValue)
          || isPair(end, '*', isNextIndex, isStepValue)
        )
          context.report({ node, messageId: 'preferChunk' });
      },
    };
  },
});
