import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

type TimerFunction = 'clearTimeout' | 'setTimeout';

// `<path>` is a call of the global `name`: bare, or a non-computed member of `window`/`globalThis`.
const globalTimerCall = (path: string, name: TimerFunction) =>
  `[${path}.type="CallExpression"]:matches([${path}.callee.type="Identifier"][${path}.callee.name="${name}"], [${path}.callee.type="MemberExpression"][${path}.callee.computed=false][${path}.callee.object.type="Identifier"][${path}.callee.object.name=/^(window|globalThis)$/][${path}.callee.property.name="${name}"])`;

const clearTimeoutCall = (path: string) =>
  `${globalTimerCall(path, 'clearTimeout')}[${path}.arguments.length=1]`;

const statementList = ':matches(BlockStatement, Program)';

// `clearTimeout(H);`
const plainClear = `ExpressionStatement${clearTimeoutCall('expression')}`;
// `if (H) clearTimeout(H);`
const guardedClear = `IfStatement:not([alternate])[consequent.type="ExpressionStatement"]${clearTimeoutCall('consequent.expression')}`;
// `if (H) { clearTimeout(H); }`
const guardedBlockClear = `IfStatement:not([alternate])[consequent.type="BlockStatement"][consequent.body.length=1][consequent.body.0.type="ExpressionStatement"]${clearTimeoutCall('consequent.body.0.expression')}`;

const clearStatement = `:matches(${plainClear}, ${guardedClear}, ${guardedBlockClear})`;

// `H = setTimeout(…);` as its own statement, after a clear in the same statement list.
const timerAssignment = `${statementList} > ${clearStatement} ~ ExpressionStatement > AssignmentExpression[operator="="]${globalTimerCall('right', 'setTimeout')}`;

type ClearCall = TSESTree.CallExpression & {
  arguments: [TSESTree.CallExpressionArgument];
};
type ClearStatement = TSESTree.ExpressionStatement & { expression: ClearCall };
type GuardedClear = TSESTree.IfStatement & { consequent: ClearStatement };
type GuardedBlockClear = TSESTree.IfStatement & {
  consequent: TSESTree.BlockStatement & { body: [ClearStatement] };
};
type TimerAssignment = TSESTree.AssignmentExpression & {
  parent: TSESTree.ExpressionStatement;
};

export const preferDebounce = createRule({
  name: 'prefer-debounce',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `debounce` from es-toolkit instead of a hand-written `clearTimeout`/`setTimeout` pair.',
    },
    schema: [],
    messages: {
      preferDebounce:
        'Prefer `debounce` from es-toolkit instead of clearing and re-arming a `setTimeout` handle.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    // Handles cleared so far, keyed by the statement list the clear sits in. Earlier siblings
    // are traversed first, so every entry precedes the assignment that looks it up.
    const clearedHandles = new Map<TSESTree.Node, TSESTree.Node[]>();

    const recordClear = (
      statement: TSESTree.Statement,
      [handle]: ClearCall['arguments'],
      guard?: TSESTree.Expression,
    ) => {
      if (guard && !isSameExpression(sourceCode, guard, handle)) return;
      const handles = clearedHandles.get(statement.parent) ?? [];
      clearedHandles.set(statement.parent, [...handles, handle]);
    };

    const reportAssignment = (node: TimerAssignment) => {
      const handles = clearedHandles.get(node.parent.parent);
      if (
        handles?.some(handle => isSameExpression(sourceCode, handle, node.left))
      )
        context.report({ node, messageId: 'preferDebounce' });
    };

    return {
      [`${statementList} > ${plainClear}`]: (node: ClearStatement) =>
        recordClear(node, node.expression.arguments),
      [`${statementList} > ${guardedClear}`]: (node: GuardedClear) =>
        recordClear(node, node.consequent.expression.arguments, node.test),
      [`${statementList} > ${guardedBlockClear}`]: (node: GuardedBlockClear) =>
        recordClear(
          node,
          node.consequent.body[0].expression.arguments,
          node.test,
        ),
      [timerAssignment]: reportAssignment,
    };
  },
});
