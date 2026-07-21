import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

const isLiteral = (node: TSESTree.Node, value: number) =>
  node.type === 'Literal' && node.value === value;

const lowerCasedFirstChar = (node: TSESTree.Node): TSESTree.Node | null => {
  if (
    node.type !== 'CallExpression'
    || node.callee.type !== 'MemberExpression'
    || node.callee.property.type !== 'Identifier'
    || node.callee.property.name !== 'toLowerCase'
  )
    return null;

  const target = node.callee.object;
  return target.type === 'CallExpression'
    && target.callee.type === 'MemberExpression'
    && target.callee.property.type === 'Identifier'
    && target.callee.property.name === 'charAt'
    && target.arguments.length === 1
    && isLiteral(target.arguments[0], 0)
    ? target.callee.object
    : null;
};

const slicedFromOne = (node: TSESTree.Node): TSESTree.Node | null =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && node.callee.property.type === 'Identifier'
  && node.callee.property.name === 'slice'
  && node.arguments.length === 1
  && isLiteral(node.arguments[0], 1)
    ? node.callee.object
    : null;

export const preferLowerFirst = createRule({
  name: 'prefer-lower-first',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `lowerFirst` from es-toolkit over lower-casing the first character by hand.',
    },
    schema: [],
    messages: {
      preferLowerFirst:
        'Prefer `lowerFirst` from es-toolkit instead of lower-casing the first character by hand.',
    },
  },
  create(context) {
    return {
      'BinaryExpression[operator="+"]'(node: TSESTree.BinaryExpression) {
        const head = lowerCasedFirstChar(node.left);
        const tail = slicedFromOne(node.right);
        if (!head || !tail) return;

        if (
          context.sourceCode.getText(head) !== context.sourceCode.getText(tail)
        )
          return;
        context.report({ node, messageId: 'preferLowerFirst' });
      },
    };
  },
});
