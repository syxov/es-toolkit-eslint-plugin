import type { TSESTree } from '@typescript-eslint/utils';
import {
  chainPositions,
  shouldReportArrayMethodReplacement,
  type ChainPosition,
} from '../utils/array-method-chain.js';
import { createRule } from '../utils/create-rule.js';

type PreferWithoutOptions = [
  { chainPosition?: ChainPosition; skipTypePredicate?: boolean },
];

// `.filter(x => …)` with a single single-parameter arrow predicate; its body is checked below.
const filterArrow =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=1][arguments.0.params.0.type="Identifier"]';

const isParam = (node: TSESTree.Node, name: string) =>
  node.type === 'Identifier' && node.name === name;

export const preferWithout = createRule<PreferWithoutOptions, 'preferWithout'>({
  name: 'prefer-without',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `without` from es-toolkit over `arr.filter(x => x !== value)`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          chainPosition: { type: 'string', enum: [...chainPositions] },
          skipTypePredicate: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferWithout:
        'Prefer `without` from es-toolkit instead of filtering out a specific value.',
    },
  },
  defaultOptions: [{}] satisfies PreferWithoutOptions,
  create(context) {
    return {
      [filterArrow](node: TSESTree.CallExpression) {
        const arrow = node.arguments[0];
        if (arrow.type !== 'ArrowFunctionExpression') return;
        const [param] = arrow.params;
        if (param.type !== 'Identifier') return;
        const { body } = arrow;
        if (body.type !== 'BinaryExpression') return;
        if (body.operator !== '!==' && body.operator !== '!=') return;

        const typeAnnotation = arrow.returnType?.typeAnnotation;
        if (
          context.options[0]?.skipTypePredicate
          && typeAnnotation?.type === 'TSTypePredicate'
          && typeAnnotation.parameterName.type === 'Identifier'
          && typeAnnotation.parameterName.name === param.name
        )
          return;

        // Exactly one side is the bare parameter; the other is the excluded value.
        // `x => x.id !== v` (a property compare) and `x => v !== w` are left alone.
        const left = isParam(body.left, param.name);
        const right = isParam(body.right, param.name);
        if (left === right) return;

        if (
          shouldReportArrayMethodReplacement(
            node,
            context.options,
            context.settings,
          )
        )
          context.report({ node, messageId: 'preferWithout' });
      },
    };
  },
});
