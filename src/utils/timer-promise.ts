import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';
import { importsEsToolkitHelper } from './scope.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Executor = TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

// The call a function body consists of: `f()` or `{ f(); }`.
export const soleCall = (
  body: TSESTree.BlockStatement | TSESTree.Expression,
) => {
  let expression: TSESTree.Node = body;
  if (body.type === 'BlockStatement') {
    const [statement] = body.body;
    if (body.body.length !== 1 || statement.type !== 'ExpressionStatement')
      return null;
    expression = statement.expression;
  }
  return expression.type === 'CallExpression' ? expression : null;
};

const isFunction = (node: TSESTree.Node): node is Executor =>
  node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression';

// `() => reject(value)`, `() => { reject(value); }` or `function () { reject(value); }`.
const rejectingCallback = (callback: TSESTree.Node, reject: string) => {
  if (!isFunction(callback) || callback.params.length > 0) return null;
  const call = soleCall(callback.body);
  if (
    !call
    || !isIdentifierNamed(call.callee, reject)
    || call.arguments.length > 1
    || call.arguments[0]?.type === 'SpreadElement'
  )
    return null;
  return { value: call.arguments[0] };
};

const isUnusedParam = (
  sourceCode: SourceCode,
  executor: Executor,
  param: TSESTree.Identifier,
) =>
  sourceCode
    .getDeclaredVariables(executor)
    .find(variable => variable.name === param.name)?.references.length === 0;

export interface TimerRejection {
  value: TSESTree.Expression | undefined;
}

// `new Promise((_, reject) => setTimeout(() => reject(value), ms))` and its block-bodied,
// `setTimeout(reject, ms, value)` and `function` variants: a promise that only rejects after
// `ms`. Returns what it rejects with, or `null` for any other node.
export const timerRejection = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
): TimerRejection | null => {
  if (
    node.type !== 'NewExpression'
    || !isIdentifierNamed(node.callee, 'Promise')
    || node.arguments.length !== 1
  )
    return null;
  const [executor] = node.arguments;
  if (!isFunction(executor) || executor.params.length !== 2) return null;
  const [resolve, reject] = executor.params;
  if (
    resolve.type !== 'Identifier'
    || reject.type !== 'Identifier'
    || !isUnusedParam(sourceCode, executor, resolve)
  )
    return null;
  const timer = soleCall(executor.body);
  if (!timer || !isIdentifierNamed(timer.callee, 'setTimeout')) return null;
  const { length } = timer.arguments;
  if (length < 2 || length > 3) return null;
  const [callback, , value] = timer.arguments;
  if (isIdentifierNamed(callback, reject.name)) {
    if (length === 2) return { value: undefined };
    return value.type === 'SpreadElement' ? null : { value };
  }
  return length === 2 ? rejectingCallback(callback, reject.name) : null;
};

// es-toolkit's own `timeout(ms)` or `timeout(ms, { signal })`.
const isEsToolkitTimeoutCall = (sourceCode: SourceCode, node: TSESTree.Node) =>
  node.type === 'CallExpression'
  && node.callee.type === 'Identifier'
  && (node.arguments.length === 1 || node.arguments.length === 2)
  && importsEsToolkitHelper(sourceCode, node.callee, 'timeout');

const isTimeoutPromise = (sourceCode: SourceCode, node: TSESTree.Node) =>
  timerRejection(sourceCode, node) !== null
  || isEsToolkitTimeoutCall(sourceCode, node);

export const promiseRace =
  'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.object.name="Promise"][callee.property.name="race"][arguments.length=1][arguments.0.type="ArrayExpression"][arguments.0.elements.length=2]';

// `Promise.race([run, timer])` in either order, where exactly one entry is a promise that
// rejects after `ms`: what `withTimeout(() => run, ms)` does.
export const isWithTimeoutRace = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
): boolean => {
  if (
    node.type !== 'CallExpression'
    || node.callee.type !== 'MemberExpression'
    || node.callee.computed
    || !isIdentifierNamed(node.callee.object, 'Promise')
    || !isIdentifierNamed(node.callee.property, 'race')
    || node.arguments.length !== 1
    || node.arguments[0].type !== 'ArrayExpression'
  )
    return false;
  const { elements } = node.arguments[0];
  if (elements.length !== 2) return false;
  const [first, second] = elements;
  if (
    !first
    || !second
    || first.type === 'SpreadElement'
    || second.type === 'SpreadElement'
  )
    return false;
  return (
    isTimeoutPromise(sourceCode, first) !== isTimeoutPromise(sourceCode, second)
  );
};
