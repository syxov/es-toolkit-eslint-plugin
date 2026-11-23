import type { TSESTree } from '@typescript-eslint/utils';
import { isWriteTarget } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  nullLiteral,
  typeofUndefined,
  undefinedValue,
} from '../utils/nil-check.js';
import {
  isPositionalReceiver,
  unwrapTypes,
} from '../utils/positional-receiver.js';
import { findVariable } from '../utils/variable-sources.js';

// `raw` rather than `value`: esquery compares values as strings, so `obj["0"]` would match too.
const literalIndex = (raw: string) =>
  `MemberExpression[computed=true][property.type="Literal"][property.raw=${raw}]`;

// `s[0].toUpperCase()` and `s[0]!.toUpperCase()` belong to the string-case rules.
const caseMethod =
  'CallExpression > MemberExpression.callee[property.name=/^to(Locale)?(Upper|Lower)Case$/]';
const caseConverted = `${caseMethod} > .object, ${caseMethod} > TSNonNullExpression.object > .expression`;

// `xs[0] == null` and `typeof xs[0] === 'undefined'` belong to the nil predicate rules.
const nilComparison = (side: 'left' | 'right', other: 'left' | 'right') =>
  `BinaryExpression[operator=/^[!=]==?$/]:matches(${nullLiteral(other)}, ${undefinedValue(other)}) > .${side}`;
const nilOperand = `${nilComparison('left', 'right')}, ${nilComparison('right', 'left')}, ${typeofUndefined} > UnaryExpression > .argument`;

// `xs[0][1]`: the first element is itself a tuple.
const indexedByLiteral = `MemberExpression[computed=true][property.type="Literal"][property.raw=/^\\d+$/] > .object`;

const firstIndex = `${literalIndex('"0"')}:not(${caseConverted}, ${nilOperand}, ${indexedByLiteral})`;
const laterIndex = literalIndex('/^[1-9]\\d*$/');

const isCharLiteral = (node: TSESTree.Node) =>
  node.type === 'Literal'
  && typeof node.value === 'string'
  && node.value.length === 1;

// `s[0] === '#'` compares a character.
const isComparedToChar = ({ parent }: TSESTree.Node) =>
  parent?.type === 'BinaryExpression'
  && /^[!=]==?$/.test(parent.operator)
  && (isCharLiteral(parent.left) || isCharLiteral(parent.right));

const enclosingFunction = (node: TSESTree.Node): TSESTree.Node => {
  let current = node.parent;
  while (current && !/Function|^Program$/.test(current.type))
    current = current.parent;
  return current ?? node;
};

interface Receiver {
  firstReads: TSESTree.MemberExpression[];
  isTuple: boolean;
}

export const preferHead = createRule({
  name: 'prefer-head',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using `head` from es-toolkit instead of `arr[0]`.',
    },
    schema: [],
    messages: {
      preferHead: 'Prefer `head` from es-toolkit instead of indexing with `0`.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    // Literal-index reads grouped by receiver: a variable, or the receiver's text within a
    // function. `p[0]` next to `p[1]` reads a position of a tuple, not the head of a list.
    const receivers = new Map<object, Map<string, Receiver>>();
    const receiverOf = (node: TSESTree.MemberExpression) => {
      const object = unwrapTypes(node.object);
      const variable =
        object.type === 'Identifier' ? findVariable(sourceCode, object) : null;
      const owner = variable ?? enclosingFunction(object);
      const key = variable ? '' : sourceCode.getText(object).replace(/\s/g, '');
      const byKey = receivers.get(owner) ?? new Map<string, Receiver>();
      receivers.set(owner, byKey);
      const receiver = byKey.get(key) ?? { firstReads: [], isTuple: false };
      byKey.set(key, receiver);
      return receiver;
    };
    return {
      [firstIndex](node: TSESTree.MemberExpression) {
        if (
          !isWriteTarget(node)
          && !isComparedToChar(node)
          && !isPositionalReceiver(sourceCode, node)
        )
          receiverOf(node).firstReads.push(node);
      },
      [laterIndex](node: TSESTree.MemberExpression) {
        receiverOf(node).isTuple = true;
      },
      'Program:exit'() {
        for (const byKey of receivers.values())
          for (const { firstReads, isTuple } of byKey.values())
            if (!isTuple)
              for (const node of firstReads)
                context.report({ node, messageId: 'preferHead' });
      },
    };
  },
});
