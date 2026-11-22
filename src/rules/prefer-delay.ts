import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

type Executor = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

const executor =
  'NewExpression[callee.name="Promise"][arguments.length=1] > :matches(ArrowFunctionExpression, FunctionExpression)[params.length=1][params.0.type="Identifier"]';

const timeoutCall = (path: string) =>
  `[${path}.callee.name="setTimeout"][${path}.arguments.length=2]`;

// `resolve => setTimeout(…, ms)`
const expressionExecutor = `${executor}${timeoutCall('body')}`;

// `resolve => { setTimeout(…, ms); }` or `function (resolve) { setTimeout(…, ms); }`
const blockExecutor = `${executor}[body.type="BlockStatement"][body.body.length=1]${timeoutCall('body.body.0.expression')}`;

// The call a function body consists of: `f()` or `{ f(); }`.
const soleCall = (body: TSESTree.BlockStatement | TSESTree.Expression) => {
  let expression: TSESTree.Node = body;
  if (body.type === 'BlockStatement') {
    const [statement] = body.body;
    if (body.body.length !== 1 || statement.type !== 'ExpressionStatement')
      return null;
    expression = statement.expression;
  }
  return expression.type === 'CallExpression' ? expression : null;
};

// `resolve` itself, or `() => resolve()` / `() => { resolve(); }`.
const callsOnlyResolve = (callback: TSESTree.Node, resolve: string) => {
  if (isIdentifierNamed(callback, resolve)) return true;
  if (callback.type !== 'ArrowFunctionExpression' || callback.params.length > 0)
    return false;
  const call = soleCall(callback.body);
  return (
    call !== null
    && call.arguments.length === 0
    && isIdentifierNamed(call.callee, resolve)
  );
};

export const preferDelay = createRule({
  name: 'prefer-delay',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `delay` from es-toolkit instead of `new Promise` + `setTimeout`.',
    },
    schema: [],
    messages: {
      preferDelay:
        'Prefer `delay` from es-toolkit instead of wrapping `setTimeout` in a `new Promise`.',
    },
  },
  create(context) {
    const report = (node: Executor) => {
      const [resolve] = node.params;
      const timeout = soleCall(node.body);
      if (
        resolve.type === 'Identifier'
        && timeout
        && callsOnlyResolve(timeout.arguments[0], resolve.name)
      )
        context.report({ node: node.parent, messageId: 'preferDelay' });
    };
    return { [expressionExecutor]: report, [blockExecutor]: report };
  },
});
