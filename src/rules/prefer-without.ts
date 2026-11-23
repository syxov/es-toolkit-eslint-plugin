import type { TSESTree } from '@typescript-eslint/utils';
import {
  chainPositionOption,
  shouldReportArrayMethodReplacement,
  type ChainPositionOption,
} from '../utils/array-method-chain.js';
import { isIdentifierNamed, referencesParam } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { isOptionalCall } from '../utils/optional-chain.js';
import { filterArrow } from '../utils/selectors.js';

// `x => x !== null` (also `undefined`, `void 0`, `false`): TypeScript infers a type predicate
// that narrows the element type, while `without(xs, null)` widens it to `T | null`. A loose
// `x != null` is a nil check, left to `prefer-is-not-nil`.
const isNarrowingValue = (node: TSESTree.Node) =>
  (node.type === 'Literal' && (node.raw === 'null' || node.value === false))
  || isIdentifierNamed(node, 'undefined')
  || (node.type === 'UnaryExpression' && node.operator === 'void');

type PreferWithoutOptions = [
  ChainPositionOption & {
    checkLooseInequality?: boolean;
    skipTypePredicate?: boolean;
  },
];

export const preferWithout = createRule<PreferWithoutOptions, 'preferWithout'>({
  name: 'prefer-without',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `without` from es-toolkit instead of `arr.filter(x => x !== value)`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          chainPosition: chainPositionOption,
          checkLooseInequality: {
            type: 'boolean',
            description:
              'Also report loose `!=` comparisons (`x => x != value`), which coerce unlike `without`.',
          },
          skipTypePredicate: {
            type: 'boolean',
            description:
              'Skip predicates annotated as a type guard on the parameter (`(x): x is T => …`). Defaults to `true`.',
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      { skipTypePredicate: true },
    ] satisfies PreferWithoutOptions,
    messages: {
      preferWithout:
        'Prefer `without` from es-toolkit instead of filtering out a specific value.',
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
        if (body.type !== 'BinaryExpression') return;
        if (
          body.operator !== '!=='
          && !(body.operator === '!=' && options.checkLooseInequality)
        )
          return;

        const typeAnnotation = arrow.returnType?.typeAnnotation;
        if (
          options.skipTypePredicate
          && typeAnnotation?.type === 'TSTypePredicate'
          && isIdentifierNamed(typeAnnotation.parameterName, param.name)
        )
          return;

        // Exactly one side is the bare parameter; the other is the excluded value, which
        // must not depend on the element (`x => x !== f(x)` is not a fixed value).
        const value = isIdentifierNamed(body.left, param.name)
          ? body.right
          : isIdentifierNamed(body.right, param.name)
            ? body.left
            : null;
        if (
          value
          && !isNarrowingValue(value)
          && !referencesParam(context.sourceCode, arrow, value)
          && !isOptionalCall(node)
          && shouldReportArrayMethodReplacement(node, options, context.settings)
        )
          context.report({ node, messageId: 'preferWithout' });
      },
    };
  },
});
