import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `new Promise(resolve => setTimeout(resolve, ms))` — a single-param executor whose
// expression body is a two-argument `setTimeout` whose first argument is an identifier.
const expressionExecutor =
  'NewExpression[callee.name="Promise"][arguments.length=1] > ArrowFunctionExpression[params.length=1][params.0.type="Identifier"][body.callee.name="setTimeout"][body.arguments.length=2][body.arguments.0.type="Identifier"]';

// The block-bodied form `new Promise(resolve => { setTimeout(resolve, ms); })` — a single
// statement that is the same two-argument `setTimeout`.
const blockExecutor =
  'NewExpression[callee.name="Promise"][arguments.length=1] > ArrowFunctionExpression[params.length=1][params.0.type="Identifier"][body.type="BlockStatement"][body.body.length=1][body.body.0.type="ExpressionStatement"][body.body.0.expression.callee.name="setTimeout"][body.body.0.expression.arguments.length=2][body.body.0.expression.arguments.0.type="Identifier"]';

export const preferDelay = createRule({
  name: 'prefer-delay',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `delay` from es-toolkit over `new Promise` + `setTimeout`.',
    },
    schema: [],
    messages: {
      preferDelay:
        'Prefer `delay` from es-toolkit instead of wrapping `setTimeout` in a `new Promise`.',
    },
  },
  create(context) {
    // Confirm the timeout callback IS the promise's own `resolve` (a pure delay).
    const isPureDelay = (
      param: TSESTree.Parameter,
      timeout: TSESTree.CallExpression,
    ) => {
      const [callback] = timeout.arguments;
      return (
        param.type === 'Identifier'
        && callback.type === 'Identifier'
        && param.name === callback.name
      );
    };

    const reportPromise = (node: TSESTree.ArrowFunctionExpression) =>
      context.report({ node: node.parent, messageId: 'preferDelay' });

    return {
      [expressionExecutor](node: TSESTree.ArrowFunctionExpression) {
        if (
          node.body.type === 'CallExpression'
          && isPureDelay(node.params[0], node.body)
        ) {
          reportPromise(node);
        }
      },
      [blockExecutor](node: TSESTree.ArrowFunctionExpression) {
        if (node.body.type !== 'BlockStatement') return;
        const [statement] = node.body.body;
        if (
          statement.type === 'ExpressionStatement'
          && statement.expression.type === 'CallExpression'
          && isPureDelay(node.params[0], statement.expression)
        ) {
          reportPromise(node);
        }
      },
    };
  },
});
