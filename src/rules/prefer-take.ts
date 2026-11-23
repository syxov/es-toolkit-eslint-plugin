import type { TSESTree } from '@typescript-eslint/utils';
import { isLiteralValue, isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { isNonArraySlice } from '../utils/non-array-receiver.js';
import { arraySliceCall } from '../utils/selectors.js';
import { findDescendants, statementScope } from '../utils/statement.js';

type TakeSlice = TSESTree.CallExpression & {
  callee: TSESTree.MemberExpression;
};

// `raw` rather than `value`: esquery compares values as strings, so `slice('0', n)` would match too.
// A negative end (`slice(0, -n)`, `slice(0, c ? -2 : -1)`) drops from the end; `slice(0, -1)`
// belongs to prefer-initial.
const takeSlice = arraySliceCall(
  '[arguments.length=2][arguments.0.type="Literal"][arguments.0.raw="0"]:not([arguments.1.type="UnaryExpression"][arguments.1.operator="-"]):not([arguments.1.type="ConditionalExpression"]:matches([arguments.1.consequent.type="UnaryExpression"][arguments.1.consequent.operator="-"], [arguments.1.alternate.type="UnaryExpression"][arguments.1.alternate.operator="-"]))',
);

export const preferTake = createRule({
  name: 'prefer-take',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `take` from es-toolkit instead of `arr.slice(0, n)`.',
    },
    schema: [],
    messages: {
      preferTake: 'Prefer `take` from es-toolkit instead of `arr.slice(0, n)`.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const isReceiver = (node: TSESTree.Node, call: TakeSlice) =>
      isSameExpression(sourceCode, node, call.callee.object);
    // `xs.slice(0, xs.length - k)` drops from the end: `initial` / `dropRight`.
    const dropsFromEnd = (call: TakeSlice) => {
      const end = call.arguments[1];
      return (
        end.type === 'BinaryExpression'
        && end.operator === '-'
        && end.left.type === 'MemberExpression'
        && !end.left.computed
        && end.left.property.type === 'Identifier'
        && end.left.property.name === 'length'
        && isReceiver(end.left.object, call)
      );
    };
    // `[...xs.slice(0, i), x, ...xs.slice(i + 1)]`, `[...xs.slice(n), ...xs.slice(0, n)]`: half of
    // a splice or a rotation, whose other half is not a `take`. A `takeRight` half
    // (`xs.slice(-n)`) or the other branch of a conditional is an independent slice.
    const isSplicePair = (call: TakeSlice) =>
      statementScope(call).some(
        scope =>
          findDescendants(sourceCode, scope, other => {
            if (
              other === call
              || other.type !== 'CallExpression'
              || other.callee.type !== 'MemberExpression'
              || other.callee.computed
              || other.callee.property.type !== 'Identifier'
              || other.callee.property.name !== 'slice'
              || (other.parent === call.parent
                && call.parent.type === 'ConditionalExpression')
              || !isReceiver(other.callee.object, call)
            )
              return false;
            const [start] = other.arguments;
            return (
              other.arguments.length > 0
              && !isLiteralValue(start, 0)
              && !(start.type === 'UnaryExpression' && start.operator === '-')
            );
          }).length > 0,
      );
    return {
      [takeSlice](node: TakeSlice) {
        if (
          !dropsFromEnd(node)
          && !isNonArraySlice(sourceCode, node)
          && !isSplicePair(node)
        )
          context.report({ node, messageId: 'preferTake' });
      },
    };
  },
});
