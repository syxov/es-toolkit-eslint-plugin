import type { TSESTree } from '@typescript-eslint/utils';
import { isSameExpression, isWriteTarget } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import {
  hasStringGuard,
  isNonArrayReceiver,
  isNonArraySlice,
} from '../utils/non-array-receiver.js';
import { findDescendants, statementScope } from '../utils/statement.js';
import { lastSliceElement } from '../utils/selectors.js';

type LengthMinusIndex = TSESTree.MemberExpression & {
  property: TSESTree.BinaryExpression & {
    left: TSESTree.MemberExpression;
    right: TSESTree.Literal;
  };
};

// `arr[arr.length - k]`: a computed access whose index is `<something>.length - <literal>`.
const lengthMinusIndex =
  'MemberExpression[computed=true][property.type="BinaryExpression"][property.operator="-"][property.right.type="Literal"][property.left.type="MemberExpression"][property.left.computed=false][property.left.property.name="length"]';

const isLengthMinusIndex = (node: TSESTree.Node): node is LengthMinusIndex =>
  node.type === 'MemberExpression'
  && node.computed
  && node.property.type === 'BinaryExpression'
  && node.property.operator === '-'
  && node.property.right.type === 'Literal'
  && node.property.left.type === 'MemberExpression'
  && !node.property.left.computed
  && node.property.left.property.type === 'Identifier'
  && node.property.left.property.name === 'length';

export const preferLast = createRule({
  name: 'prefer-last',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `last` from es-toolkit instead of `arr[arr.length - 1]`.',
    },
    schema: [],
    messages: {
      preferLast:
        'Prefer `last` from es-toolkit instead of indexing with `arr.length - 1`.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    const indexes = (node: LengthMinusIndex, object: TSESTree.Node) =>
      isSameExpression(sourceCode, node.object, object)
      && isSameExpression(sourceCode, node.property.left.object, object);
    // `a[a.length - 1]` next to `a[a.length - 2]`: rewriting one of them breaks the symmetry.
    const hasSiblingIndex = (node: TSESTree.Node, object: TSESTree.Node) =>
      statementScope(node).some(
        scope =>
          findDescendants(
            sourceCode,
            scope,
            candidate =>
              isLengthMinusIndex(candidate)
              && typeof candidate.property.right.value === 'number'
              && candidate.property.right.value >= 2
              && indexes(candidate, object),
          ).length > 0,
      );
    return {
      [`${lengthMinusIndex}[property.right.raw="1"]`](node: LengthMinusIndex) {
        if (
          !isWriteTarget(node)
          && indexes(node, node.object)
          && !isNonArrayReceiver(sourceCode, node.object)
          && !hasStringGuard(sourceCode, node, node.object)
          && !hasSiblingIndex(node, node.object)
        )
          context.report({ node, messageId: 'preferLast' });
      },
      [lastSliceElement](node: TSESTree.MemberExpression) {
        if (
          !isWriteTarget(node)
          && !isNonArraySlice(
            sourceCode,
            node.object as TSESTree.CallExpression,
          )
        )
          context.report({ node, messageId: 'preferLast' });
      },
    };
  },
});
