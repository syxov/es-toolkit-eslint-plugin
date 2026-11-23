import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { pairEndingAt } from '../utils/logical-pair.js';
import {
  isLonePlainObjectTest,
  isPlainObjectSite,
  isPrototypePair,
} from '../utils/plain-object-test.js';

// Narrows the candidates to comparisons with `'[object Object]'`, `….prototype` or `Object`;
// `parsePlainObjectTest` checks the other operand.
const plainObjectComparison =
  'BinaryExpression[operator=/^[!=]==?$/]:matches([left.value="[object Object]"], [right.value="[object Object]"], [left.property.name="prototype"], [right.property.name="prototype"], [left.name="Object"], [right.name="Object"])';

export const preferIsPlainObject = createRule({
  name: 'prefer-is-plain-object',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isPlainObject` from es-toolkit instead of `Object.getPrototypeOf(value) === Object.prototype`, `value.constructor === Object` or an `[object Object]` tag check.',
    },
    schema: [],
    messages: {
      preferIsPlainObject:
        'Prefer `isPlainObject` from es-toolkit instead of checking for a plain object by hand.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      [plainObjectComparison](node: TSESTree.BinaryExpression) {
        if (
          isLonePlainObjectTest(sourceCode, node)
          && isPlainObjectSite(sourceCode, node)
        )
          context.report({ node, messageId: 'preferIsPlainObject' });
      },
      'LogicalExpression[operator=/^(&&|\\|\\|)$/]'(
        node: TSESTree.LogicalExpression,
      ) {
        const [left, right] = pairEndingAt(node);
        if (
          isPrototypePair(sourceCode, node.operator, left, right)
          && isPlainObjectSite(sourceCode, node)
        )
          context.report({
            loc: { start: left.loc.start, end: right.loc.end },
            messageId: 'preferIsPlainObject',
          });
      },
    };
  },
});
