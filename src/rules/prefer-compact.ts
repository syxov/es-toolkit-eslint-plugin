import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { isIdentifierNamed } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { filterArrow } from '../utils/selectors.js';

const filterBoolean =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.name="Boolean"]';

// The predicate keeps only truthy values: `x => x`, `x => !!x` or `x => Boolean(x)`.
const isTruthinessOf = (body: TSESTree.Node, param: string) =>
  isIdentifierNamed(body, param)
  || (body.type === 'UnaryExpression'
    && body.operator === '!'
    && body.argument.type === 'UnaryExpression'
    && body.argument.operator === '!'
    && isIdentifierNamed(body.argument.argument, param))
  || (body.type === 'CallExpression'
    && isIdentifierNamed(body.callee, 'Boolean')
    && body.arguments.length === 1
    && isIdentifierNamed(body.arguments[0], param));

export const preferCompact = createRule({
  name: 'prefer-compact',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `compact` from es-toolkit instead of a truthiness filter.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferCompact:
        'Prefer `compact` from es-toolkit instead of filtering by truthiness.',
    },
  },
  create(context, [options]) {
    const report = (node: TSESTree.CallExpression) =>
      shouldReportArrayMethodReplacement(node, options, context.settings)
      && context.report({ node, messageId: 'preferCompact' });

    return {
      [filterBoolean]: report,
      [filterArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [param] = arrow.params;
        if (param.type !== 'Identifier') return;
        if (isTruthinessOf(arrow.body, param.name)) report(node);
      },
    };
  },
});
