import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
export const preferIsTypedArray = createRule({
  name: 'prefer-is-typed-array',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `isTypedArray` over checking an ArrayBuffer view that is not a DataView.',
    },
    schema: [],
    messages: {
      preferIsTypedArray:
        'Prefer `isTypedArray` from es-toolkit instead of checking ArrayBuffer views by hand.',
    },
  },
  create(context) {
    return {
      'LogicalExpression[operator="&&"][left.callee.object.name="ArrayBuffer"][left.callee.property.name="isView"][left.arguments.length=1][right.operator="!"][right.argument.operator="instanceof"][right.argument.right.name="DataView"]':
        (node: TSESTree.Node) =>
          context.report({ node, messageId: 'preferIsTypedArray' }),
    };
  },
});
