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

// The receiver of `<recv>.slice(1)`, else null.
const slicedFromOne = (node: TSESTree.Node): TSESTree.Node | null =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && node.callee.property.type === 'Identifier'
  && node.callee.property.name === 'slice'
  && node.arguments.length === 1
  && isLiteral(node.arguments[0], 1)
    ? node.callee.object
    : null;

export const preferUpperFirst = createRule({
  name: 'prefer-upper-first',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `upperFirst` from es-toolkit over `s.charAt(0).toUpperCase() + s.slice(1)`.',
    },
    schema: [],
    messages: {
      preferUpperFirst:
        'Prefer `upperFirst` from es-toolkit instead of upper-casing the first character by hand.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="+"]'(node: TSESTree.BinaryExpression) {
        const head = upperCasedFirstChar(node.left);
        const tail = slicedFromOne(node.right);
        if (!head || !tail) return;

        // Both halves must operate on the same receiver: `s.…() + s.slice(1)`.
        const { sourceCode } = context;
        if (sourceCode.getText(head) !== sourceCode.getText(tail)) return;

        context.report({ node, messageId: 'preferUpperFirst' });
      },
    };
  },
});
