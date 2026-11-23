import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed, referencesParam } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { isStringLikeReceiver } from '../utils/includes-receiver.js';
import { isNonArrayReceiver } from '../utils/non-array-receiver.js';
import { isOptionalCall } from '../utils/optional-chain.js';
import { hasStringName } from '../utils/string-name.js';

// `subset.every(x => superset.includes(x))`; the `includes` receiver is checked in JS.
const everyIncludes =
  'CallExpression[optional=false][callee.type="MemberExpression"][callee.computed=false][callee.property.name="every"][arguments.length=1][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=1][arguments.0.params.0.type="Identifier"][arguments.0.body.type="CallExpression"][arguments.0.body.optional=false][arguments.0.body.arguments.length=1][arguments.0.body.callee.type="MemberExpression"][arguments.0.body.callee.optional=false][arguments.0.body.callee.computed=false][arguments.0.body.callee.property.name="includes"]';

type EveryIncludes = TSESTree.CallExpression & {
  callee: TSESTree.MemberExpression;
  arguments: [
    TSESTree.ArrowFunctionExpression & {
      params: [TSESTree.Identifier];
      body: TSESTree.CallExpression & { callee: TSESTree.MemberExpression };
    },
  ];
};

export const preferIsSubset = createRule({
  name: 'prefer-is-subset',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `isSubset` from es-toolkit instead of `subset.every(x => superset.includes(x))`.',
    },
    schema: [],
    messages: {
      preferIsSubset:
        'Prefer `isSubset` from es-toolkit instead of checking that every element is included in another array.',
    },
  },
  create(context) {
    const { sourceCode } = context;
    return {
      [everyIncludes](node: EveryIncludes) {
        const [callback] = node.arguments;
        const superset = callback.body.callee.object;
        if (
          isIdentifierNamed(callback.body.arguments[0], callback.params[0].name)
          && !referencesParam(sourceCode, callback, superset)
          && !isStringLikeReceiver(superset)
          && !isNonArrayReceiver(sourceCode, superset)
          && !hasStringName(superset)
          && !isNonArrayReceiver(sourceCode, node.callee.object)
          && !isOptionalCall(node)
        )
          context.report({ node, messageId: 'preferIsSubset' });
      },
    };
  },
});
