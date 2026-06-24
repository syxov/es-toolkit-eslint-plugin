import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const isLiteral = (node: TSESTree.Node, value: number) =>
  node.type === 'Literal' && node.value === value;

// The receiver of `<recv>.charAt(0).toUpperCase()` or `<recv>[0].toUpperCase()`, else null.
const upperCasedFirstChar = (node: TSESTree.Node): TSESTree.Node | null => {
  if (
    node.type !== 'CallExpression'
    || node.callee.type !== 'MemberExpression'
    || node.callee.property.type !== 'Identifier'
    || node.callee.property.name !== 'toUpperCase'
  )
    return null;

  const target = node.callee.object;
  if (
    target.type === 'CallExpression'
    && target.callee.type === 'MemberExpression'
    && target.callee.property.type === 'Identifier'
    && target.callee.property.name === 'charAt'
    && target.arguments.length === 1
    && isLiteral(target.arguments[0], 0)
  )
    return target.callee.object;
  if (
    target.type === 'MemberExpression'
    && target.computed
    && isLiteral(target.property, 0)
  )
    return target.object;
  return null;
};

// The receiver of `<recv>.slice(1).toLowerCase()`, else null.
const lowerCasedRest = (node: TSESTree.Node): TSESTree.Node | null => {
  if (
    node.type !== 'CallExpression'
    || node.callee.type !== 'MemberExpression'
    || node.callee.property.type !== 'Identifier'
    || node.callee.property.name !== 'toLowerCase'
  )
    return null;

  const slice = node.callee.object;
  return slice.type === 'CallExpression'
    && slice.callee.type === 'MemberExpression'
    && slice.callee.property.type === 'Identifier'
    && slice.callee.property.name === 'slice'
    && slice.arguments.length === 1
    && isLiteral(slice.arguments[0], 1)
    ? slice.callee.object
    : null;
};

export const preferCapitalize = createRule({
  name: 'prefer-capitalize',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `capitalize` from es-toolkit over `s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()`.',
    },
    schema: [],
    messages: {
      preferCapitalize:
        'Prefer `capitalize` from es-toolkit instead of capitalizing by hand.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="+"]'(node: TSESTree.BinaryExpression) {
        const head = upperCasedFirstChar(node.left);
        const tail = lowerCasedRest(node.right);
        if (!head || !tail) return;

        // Both halves must operate on the same receiver.
        const { sourceCode } = context;
        if (sourceCode.getText(head) !== sourceCode.getText(tail)) return;

        context.report({ node, messageId: 'preferCapitalize' });
      },
    };
  },
});
