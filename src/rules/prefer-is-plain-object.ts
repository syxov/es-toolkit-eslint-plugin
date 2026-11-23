import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isPairOperand, pairEndingAt } from '../utils/logical-pair.js';
import {
  isPrototypePair,
  parsePlainObjectTest,
} from '../utils/plain-object-test.js';
import { isExcludedPredicateSite } from '../utils/predicate-site.js';

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
    const isReportable = (node: TSESTree.Node) =>
      !isExcludedPredicateSite(sourceCode, node, 'isPlainObject');
    const isPair = (
      operator: TSESTree.LogicalExpression['operator'],
      left: TSESTree.Node,
      right: TSESTree.Node,
    ) => isPrototypePair(sourceCode, operator, left, right);
    return {
      [plainObjectComparison](node: TSESTree.BinaryExpression) {
        if (
          parsePlainObjectTest(sourceCode, node)
          && !isPairOperand(node, isPair)
          && isReportable(node)
        )
          context.report({ node, messageId: 'preferIsPlainObject' });
      },
      'LogicalExpression[operator=/^(&&|\\|\\|)$/]'(
        node: TSESTree.LogicalExpression,
      ) {
        const [left, right] = pairEndingAt(node);
        if (isPair(node.operator, left, right) && isReportable(node))
          context.report({
            loc: { start: left.loc.start, end: right.loc.end },
            messageId: 'preferIsPlainObject',
          });
      },
    };
  },
});
