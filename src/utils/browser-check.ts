import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';
import { isPairOperand, pairEndingAt } from './logical-pair.js';
import { isUndeclaredIdentifier } from './scope.js';
import { parseTypeTest } from './type-test.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Operator = TSESTree.LogicalExpression['operator'];

// `typeof value !== 'undefined'` is true (`inBrowser`) where the value exists, `=== 'undefined'`
// where it does not.
const typeofUndefinedTest = (node: TSESTree.Node) => {
  const test = parseTypeTest(node);
  return test?.type === 'typeof undefined' && node.type === 'BinaryExpression'
    ? { value: test.value, inBrowser: node.operator.startsWith('!') }
    : undefined;
};

// `typeof window !== 'undefined'` on the global `window` (a binding of the code's own is
// something else): whether it is true in a browser, or undefined for any other node.
export const windowCheck = (sourceCode: SourceCode, node: TSESTree.Node) => {
  const test = typeofUndefinedTest(node);
  return test
    && isIdentifierNamed(test.value, 'window')
    && isUndeclaredIdentifier(sourceCode, test.value)
    ? test.inBrowser
    : undefined;
};

const isNilLiteral = (node: TSESTree.Node) =>
  (node.type === 'Literal' && node.raw === 'null')
  || isIdentifierNamed(node, 'undefined');

// `typeof window !== 'undefined' ? window : global`, also with more tests joined by `&&`
// (`||` when negated): the global object, falling back to another global. `globalThis` is the
// rewrite there, not `isBrowser()`.
export const isGlobalObjectLookup = (
  node: TSESTree.Node,
  inBrowser: boolean,
) => {
  const joiner = inBrowser ? '&&' : '||';
  let test = node;
  while (
    test.parent?.type === 'LogicalExpression'
    && test.parent.operator === joiner
  )
    test = test.parent;
  const conditional = test.parent;
  if (
    conditional?.type !== 'ConditionalExpression'
    || conditional.test !== test
  )
    return false;
  const [found, fallback] = inBrowser
    ? [conditional.consequent, conditional.alternate]
    : [conditional.alternate, conditional.consequent];
  return isIdentifierNamed(found, 'window') && !isNilLiteral(fallback);
};

const isTypeofGlobalCheck = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  name: string,
  inBrowser: boolean,
) => {
  const test = typeofUndefinedTest(node);
  return (
    test?.inBrowser === inBrowser
    && isIdentifierNamed(test.value, name)
    && isUndeclaredIdentifier(sourceCode, test.value)
  );
};

const isWindowDocument = (node: TSESTree.Node): boolean => {
  const member = node.type === 'ChainExpression' ? node.expression : node;
  return (
    member.type === 'MemberExpression'
    && !member.computed
    && isIdentifierNamed(member.object, 'window')
    && isIdentifierNamed(member.property, 'document')
  );
};

const isNot = (node: TSESTree.Node): node is TSESTree.UnaryExpression =>
  node.type === 'UnaryExpression' && node.operator === '!';

// `window.document`, `!!window.document`, `Boolean(window.document)`.
const isTruthyDocument = (node: TSESTree.Node) =>
  isWindowDocument(node)
  || (isNot(node)
    && isNot(node.argument)
    && isWindowDocument(node.argument.argument))
  || (node.type === 'CallExpression'
    && isIdentifierNamed(node.callee, 'Boolean')
    && node.arguments.length === 1
    && !!node.arguments[0]
    && isWindowDocument(node.arguments[0]));

// `window.document != null`, `window.document !== undefined` (negated: `==`, `===`).
const isDocumentNilComparison = (node: TSESTree.Node, inBrowser: boolean) => {
  if (node.type !== 'BinaryExpression') return false;
  const { left, right, operator } = node;
  const nil = isWindowDocument(left)
    ? right
    : isWindowDocument(right)
      ? left
      : undefined;
  if (!nil) return false;
  const expected = inBrowser ? '!=' : '==';
  return (
    (operator === expected && nil.type === 'Literal' && nil.raw === 'null')
    || (operator === `${expected}=` && isIdentifierNamed(nil, 'undefined'))
  );
};

// The document half after `typeof window !== 'undefined' &&` (negated: `=== 'undefined' ||`).
const isDocumentCheck = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  inBrowser: boolean,
) => {
  const test = typeofUndefinedTest(node);
  if (test)
    return (
      test.inBrowser === inBrowser
      && (isWindowDocument(test.value)
        || isTypeofGlobalCheck(sourceCode, node, 'document', inBrowser))
    );
  return (
    (inBrowser
      ? isTruthyDocument(node)
      : isNot(node) && isTruthyDocument(node.argument))
    || isDocumentNilComparison(node, inBrowser)
  );
};

// `typeof window !== 'undefined' && window.document`, `typeof document !== 'undefined' &&
// typeof window !== 'undefined'`; negated with `=== 'undefined'` joined by `||`.
const isBrowserPair = (
  sourceCode: SourceCode,
  operator: Operator,
  left: TSESTree.Node,
  right: TSESTree.Node,
) => {
  if (operator === '??') return false;
  const inBrowser = operator === '&&';
  return (
    (windowCheck(sourceCode, left) === inBrowser
      && isDocumentCheck(sourceCode, right, inBrowser))
    || (isTypeofGlobalCheck(sourceCode, left, 'document', inBrowser)
      && windowCheck(sourceCode, right) === inBrowser)
  );
};

// The window + document pair ending at `node.right`, as the range to report.
export const browserPairIn = (
  sourceCode: SourceCode,
  node: TSESTree.LogicalExpression,
): TSESTree.SourceLocation | undefined => {
  const [left, right] = pairEndingAt(node);
  return isBrowserPair(sourceCode, node.operator, left, right)
    ? { start: left.loc.start, end: right.loc.end }
    : undefined;
};

// One half of a window + document pair, which prefer-is-browser reports as a whole.
export const isBrowserPairOperand = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) =>
  isPairOperand(node, (operator, left, right) =>
    isBrowserPair(sourceCode, operator, left, right),
  );
