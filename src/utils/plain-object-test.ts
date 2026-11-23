// prototype / constructor / tag plain-object tests; nil rules skip their guards

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  isIdentifierNamed,
  isLiteralValue,
  isSameExpression,
  stripTypeWrappers,
} from './ast.js';
import { isPairOperand, pairEndingAt } from './logical-pair.js';
import { isExcludedPredicateSite } from './predicate-site.js';
import { conditionTests } from './type-test.js';
import { findVariable } from './variable-sources.js';

type SourceCode = Readonly<TSESLint.SourceCode>;
type Operator = TSESTree.LogicalExpression['operator'];

const isMember = (node: TSESTree.Node, object: string, property: string) =>
  node.type === 'MemberExpression'
  && !node.computed
  && isIdentifierNamed(node.object, object)
  && isIdentifierNamed(node.property, property);

const isObjectPrototype = (node: TSESTree.Node) =>
  isMember(node, 'Object', 'prototype');

const isNull = (node: TSESTree.Node) =>
  node.type === 'Literal' && node.raw === 'null';

const soleArgument = (node: TSESTree.CallExpression) =>
  node.arguments.length === 1 && node.arguments[0]?.type !== 'SpreadElement'
    ? node.arguments[0]
    : undefined;

// The one declarator of a binding that is never reassigned afterwards.
const constantDeclarator = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
) => {
  const variable = findVariable(sourceCode, identifier);
  const def = variable?.defs.length === 1 ? variable.defs[0] : undefined;
  return def?.node.type === 'VariableDeclarator'
    && variable?.references.every(ref => !ref.isWrite() || ref.init)
    ? { declarator: def.node, name: def.name }
    : undefined;
};

// The value `x` in `const x = Object.getPrototypeOf(v)` stands for.
const constantInit = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
): TSESTree.Node | undefined => {
  const declarator = constantDeclarator(sourceCode, identifier)?.declarator;
  return declarator?.id.type === 'Identifier'
    ? (declarator.init ?? undefined)
    : undefined;
};

// `Object.prototype.toString`, `{}.toString`.
const isObjectToString = (node: TSESTree.Node) =>
  node.type === 'MemberExpression'
  && !node.computed
  && isIdentifierNamed(node.property, 'toString')
  && (isObjectPrototype(node.object)
    || (node.object.type === 'ObjectExpression'
      && node.object.properties.length === 0));

// `const { toString } = Object.prototype`.
const isDestructuredToString = (
  sourceCode: SourceCode,
  identifier: TSESTree.Identifier,
) => {
  const binding = constantDeclarator(sourceCode, identifier);
  const declarator = binding?.declarator;
  return (
    declarator?.id.type === 'ObjectPattern'
    && !!declarator.init
    && isObjectPrototype(declarator.init)
    && declarator.id.properties.some(
      property =>
        property.type === 'Property'
        && !property.computed
        && isIdentifierNamed(property.key, 'toString')
        && property.value === binding?.name,
    )
  );
};

// `Object.prototype.toString` itself or a constant alias of it.
const isToStringReference = (sourceCode: SourceCode, node: TSESTree.Node) => {
  if (isObjectToString(node)) return true;
  if (node.type !== 'Identifier') return false;
  const init = constantInit(sourceCode, node);
  return init
    ? isObjectToString(init)
    : isDestructuredToString(sourceCode, node);
};

// `Object.prototype.toString.call(value)`: the value whose tag is read.
const taggedValue = (sourceCode: SourceCode, node: TSESTree.Node) =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && !node.callee.computed
  && isIdentifierNamed(node.callee.property, 'call')
  && isToStringReference(sourceCode, node.callee.object)
    ? soleArgument(node)
    : undefined;

const getPrototypeOfArgument = (node: TSESTree.Node) => {
  const call = stripTypeWrappers(node);
  return call.type === 'CallExpression'
    && isMember(call.callee, 'Object', 'getPrototypeOf')
    ? soleArgument(call)
    : undefined;
};

interface PrototypeRead {
  // `Object.getPrototypeOf(value)`, or the constant `proto` that holds it.
  read: TSESTree.Node;
  value: TSESTree.Node;
}

const prototypeRead = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
): PrototypeRead | undefined => {
  const direct = getPrototypeOfArgument(node);
  if (direct) return { read: node, value: direct };
  if (node.type !== 'Identifier') return undefined;
  const init = constantInit(sourceCode, node);
  const value = init && getPrototypeOfArgument(init);
  return value ? { read: node, value } : undefined;
};

const constructorOf = (node: TSESTree.Node) => {
  const member = node.type === 'ChainExpression' ? node.expression : node;
  return member.type === 'MemberExpression'
    && !member.computed
    && isIdentifierNamed(member.property, 'constructor')
    ? member.object
    : undefined;
};

export interface PlainObjectTest {
  value: TSESTree.Node;
  negated: boolean;
  // The prototype read of an `Object.getPrototypeOf(value) === Object.prototype` test.
  read?: TSESTree.Node;
}

const sidesOf = (
  node: TSESTree.BinaryExpression,
): [TSESTree.Node, TSESTree.Node][] => [
  [node.left, node.right],
  [node.right, node.left],
];

// `Object.prototype.toString.call(v) === '[object Object]'`,
// `Object.getPrototypeOf(v) === Object.prototype` or `v.constructor === Object`, with any
// equality operator and in either operand order.
export const parsePlainObjectTest = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
): PlainObjectTest | undefined => {
  if (node.type !== 'BinaryExpression' || !/^[!=]==?$/.test(node.operator))
    return undefined;
  const negated = node.operator.startsWith('!');
  for (const [expected, actual] of sidesOf(node)) {
    if (isLiteralValue(expected, '[object Object]')) {
      const value = taggedValue(sourceCode, actual);
      if (value) return { value, negated };
    }
    if (isObjectPrototype(expected)) {
      const read = prototypeRead(sourceCode, actual);
      if (read) return { ...read, negated };
    }
    if (isIdentifierNamed(expected, 'Object')) {
      const value = constructorOf(actual);
      if (value) return { value, negated };
    }
  }
  return undefined;
};

// `Object.getPrototypeOf(v) === null`: the prototype read compared with `null`.
const parsePrototypeNullTest = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) => {
  if (node.type !== 'BinaryExpression' || !/^[!=]==?$/.test(node.operator))
    return undefined;
  const negated = node.operator.startsWith('!');
  for (const [expected, actual] of sidesOf(node)) {
    const read = isNull(expected) ? actual : undefined;
    if (read && prototypeRead(sourceCode, read)) return { read, negated };
  }
  return undefined;
};

// `proto === Object.prototype || proto === null` (negated: `!==` joined by `&&`), any order.
export const isPrototypePair = (
  sourceCode: SourceCode,
  operator: Operator,
  a: TSESTree.Node,
  b: TSESTree.Node,
) => {
  const negated = operator === '&&';
  if (operator === '??') return false;
  const orders: [TSESTree.Node, TSESTree.Node][] = [
    [a, b],
    [b, a],
  ];
  return orders.some(([first, second]) => {
    const test = parsePlainObjectTest(sourceCode, first);
    const nullTest = parsePrototypeNullTest(sourceCode, second);
    return (
      !!test?.read
      && !!nullTest
      && test.negated === negated
      && nullTest.negated === negated
      && isSameExpression(sourceCode, test.read, nullTest.read)
    );
  });
};

// `x !== null && Object.getPrototypeOf(x) === Object.prototype`, `proto === null || proto ===
// Object.prototype`: the nil check guards or completes a plain-object test of the same value,
// which prefer-is-plain-object reports.
export const isPartOfPlainObjectTest = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  value: TSESTree.Node,
) =>
  conditionTests(node).some(test => {
    const plain = parsePlainObjectTest(sourceCode, test);
    return (
      !!plain
      && [plain.value, plain.read].some(
        tested => !!tested && isSameExpression(sourceCode, tested, value),
      )
    );
  });

// prefer-is-plain-object can report the code at `node` (the `isPlainObject` name is free and
// it is no test assertion).
export const isPlainObjectSite = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) => !isExcludedPredicateSite(sourceCode, node, 'isPlainObject');

// A single plain-object test that is not one operand of a prototype pair, which
// prefer-is-plain-object reports on its own.
export const isLonePlainObjectTest = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) =>
  !!parsePlainObjectTest(sourceCode, node)
  && !isPairOperand(node, (operator, left, right) =>
    isPrototypePair(sourceCode, operator, left, right),
  );

// prefer-is-plain-object reports `node` as a whole: a lone test, or a two-operand prototype
// pair (`proto === Object.prototype || proto === null`).
export const isReportedPlainObjectTest = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
) => {
  const reported =
    node.type === 'LogicalExpression'
      ? pairEndingAt(node)[0] === node.left
        && isPrototypePair(sourceCode, node.operator, node.left, node.right)
      : isLonePlainObjectTest(sourceCode, node);
  return reported && isPlainObjectSite(sourceCode, node);
};
