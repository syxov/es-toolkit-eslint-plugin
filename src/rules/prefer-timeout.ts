import type { TSESTree } from '@typescript-eslint/utils';
import { isEvaluatedInBrowser } from '../utils/browser-evaluation.js';
import { createRule } from '../utils/create-rule.js';
import { isWithTimeoutRace, timerRejection } from '../utils/timer-promise.js';

type Executor = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

const executor =
  'NewExpression[callee.name="Promise"][arguments.length=1] > :matches(ArrowFunctionExpression, FunctionExpression)[params.length=2][params.1.type="Identifier"]';

// `(_, reject) => setTimeout(…)`
const expressionExecutor = `${executor}[body.callee.name="setTimeout"]`;

// `(_, reject) => { setTimeout(…); }` or `function (_, reject) { setTimeout(…); }`
const blockExecutor = `${executor}[body.type="BlockStatement"][body.body.length=1][body.body.0.expression.callee.name="setTimeout"]`;

const timeoutWording = /timed?[\s_-]?out/i;

const staticText = (node: TSESTree.Node) => {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal' && typeof node.value === 'string')
    return node.value;
  if (node.type === 'TemplateLiteral')
    return node.quasis.map(quasi => quasi.value.cooked).join(' ');
  return '';
};

// `'timeout'`, `new Error('Request timed out')`, `new TimeoutError()`: `TimeoutError` keeps
// the meaning. Any other value is a failure simulated after a delay, which `timeout` would
// replace.
const describesTimeout = (value: TSESTree.Expression) =>
  value.type === 'NewExpression' || value.type === 'CallExpression'
    ? timeoutWording.test(staticText(value.callee))
      || value.arguments.some(argument =>
        timeoutWording.test(staticText(argument)),
      )
    : timeoutWording.test(staticText(value));

export const preferTimeout = createRule({
  name: 'prefer-timeout',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `timeout` from es-toolkit instead of a `new Promise` that rejects from `setTimeout`.',
    },
    schema: [],
    messages: {
      preferTimeout:
        'Prefer `timeout` from es-toolkit instead of a `new Promise` that rejects from `setTimeout`.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const report = (node: Executor) => {
      const promise = node.parent as TSESTree.NewExpression;
      const rejection = timerRejection(sourceCode, promise);
      if (
        rejection
        && (!rejection.value || describesTimeout(rejection.value))
        && !(
          promise.parent.type === 'ArrayExpression'
          && isWithTimeoutRace(sourceCode, promise.parent.parent)
        )
        && !isEvaluatedInBrowser(promise)
      )
        context.report({ node: promise, messageId: 'preferTimeout' });
    };
    return { [expressionExecutor]: report, [blockExecutor]: report };
  },
});
