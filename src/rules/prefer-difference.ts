import type { TSESTree } from '@typescript-eslint/utils';
import {
  arrayMethodRuleSchema,
  shouldReportArrayMethodReplacement,
  type ArrayMethodRuleOptions,
} from '../utils/array-method-chain.js';
import { isIdentifierNamed, referencesParam } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { isStringLikeReceiver } from '../utils/includes-receiver.js';
import { isOptionalCall } from '../utils/optional-chain.js';
import { filterArrow } from '../utils/selectors.js';

export const preferDifference = createRule({
  name: 'prefer-difference',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `difference` from es-toolkit instead of `a.filter(x => !b.includes(x))`.',
    },
    schema: arrayMethodRuleSchema,
    defaultOptions: [{}] satisfies ArrayMethodRuleOptions,
    messages: {
      preferDifference:
        'Prefer `difference` from es-toolkit instead of filtering out members of another array.',
    },
  },
  create(context, [options]) {
    return {
      [filterArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [param] = arrow.params;
        if (param.type !== 'Identifier') return;
        const { body } = arrow;

        // `x => !b.includes(x)`, where `b` does not depend on `x`.
        if (
          body.type !== 'UnaryExpression'
          || body.operator !== '!'
          || body.argument.type !== 'CallExpression'
        )
          return;
        const { callee, arguments: args } = body.argument;
        if (
          callee.type === 'MemberExpression'
          && isIdentifierNamed(callee.property, 'includes')
          && !callee.computed
          && args.length === 1
          && isIdentifierNamed(args[0], param.name)
          && !referencesParam(context.sourceCode, arrow, callee.object)
          && !isStringLikeReceiver(callee.object)
          // `!['a', 'b'].includes(x)` excludes listed values: `without(xs, 'a', 'b')` fits.
          && callee.object.type !== 'ArrayExpression'
          && !isOptionalCall(node)
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node, messageId: 'preferDifference' });
      },
    };
  },
});
