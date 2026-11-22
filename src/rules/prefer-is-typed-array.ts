import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';

type Side = 'left' | 'right';

const isView = (side: Side) =>
  `[${side}.type="CallExpression"][${side}.callee.object.name="ArrayBuffer"][${side}.callee.property.name="isView"][${side}.arguments.length=1]`;

const notDataView = (side: Side) =>
  `[${side}.operator="!"][${side}.argument.operator="instanceof"][${side}.argument.right.type="Identifier"][${side}.argument.right.name="DataView"]`;

// `ArrayBuffer.isView(x) && !(x instanceof DataView)`, in either operand order.
const viewCheck = (view: Side, dataView: Side) =>
  `LogicalExpression[operator="&&"]${isView(view)}${notDataView(dataView)}`;

// The value passed to `ArrayBuffer.isView(…)` or tested by `!(… instanceof DataView)`.
const checkedValue = (operand: TSESTree.Expression) => {
  if (operand.type === 'CallExpression') return operand.arguments[0];
  if (
    operand.type === 'UnaryExpression'
    && operand.argument.type === 'BinaryExpression'
  )
    return operand.argument.left;
  return undefined;
};

export const preferIsTypedArray = createRule({
  name: 'prefer-is-typed-array',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isTypedArray` from es-toolkit instead of checking an ArrayBuffer view that is not a DataView.',
    },
    schema: [],
    messages: {
      preferIsTypedArray:
        'Prefer `isTypedArray` from es-toolkit instead of checking ArrayBuffer views by hand.',
    },
  },
  create(context) {
    const report = (node: TSESTree.LogicalExpression) => {
      const a = checkedValue(node.left);
      const b = checkedValue(node.right);
      if (a && b && isSameExpression(context.sourceCode, a, b))
        context.report({ node, messageId: 'preferIsTypedArray' });
    };
    return {
      [viewCheck('left', 'right')]: report,
      [viewCheck('right', 'left')]: report,
    };
  },
});
