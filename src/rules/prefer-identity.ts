import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { memberFunction } from '../utils/selectors.js';

type IdentityFunction =
  TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;

// A sole `.filter` argument is a truthiness filter owned by prefer-compact, even when its
// chain policy keeps it silent. A sole `.map` argument copies the collection: drop the map, or
// write `[...xs]` / `Array.from(xs)`, rather than map with `identity`.
const notOwnedElsewhere = `:not(CallExpression[callee.property.name=/^(filter|map)$/][arguments.length=1] > .arguments, ${memberFunction})`;

// A typed or generic function states a signature (an exported API, a selector input) that the
// generic `identity` would not keep.
const singleIdentifierParam =
  '[async=false][params.length=1][params.0.type="Identifier"]:not([params.0.typeAnnotation], [typeParameters], [returnType])';

const returnsIdentifier =
  '[body.type="BlockStatement"][body.body.length=1][body.body.0.type="ReturnStatement"][body.body.0.argument.type="Identifier"]';

const identityArrow = `ArrowFunctionExpression${singleIdentifierParam}:matches([body.type="Identifier"], ${returnsIdentifier})${notOwnedElsewhere}`;

const identityFunction = `FunctionExpression${singleIdentifierParam}[generator=false]${returnsIdentifier}${notOwnedElsewhere}`;

const returnedValue = ({ body }: IdentityFunction) =>
  body.type === 'BlockStatement'
    ? (body.body[0] as TSESTree.ReturnStatement).argument
    : body;

// esquery cannot compare two fields, so the returned name is matched against the param here.
const returnsOwnParam = (fn: IdentityFunction) => {
  const value = returnedValue(fn);
  const [param] = fn.params;
  return (
    value !== null
    && param.type === 'Identifier'
    && isIdentifierNamed(value, param.name)
  );
};

export const preferIdentity = createRule({
  name: 'prefer-identity',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `identity` from es-toolkit instead of an inline `x => x` function.',
    },
    schema: [],
    messages: {
      preferIdentity:
        'Prefer `identity` from es-toolkit instead of an inline `x => x` function.',
    },
  },
  create(context) {
    const report = (node: IdentityFunction) =>
      returnsOwnParam(node)
      && context.report({ node, messageId: 'preferIdentity' });

    return {
      [identityArrow]: report,
      [identityFunction]: report,
    };
  },
});
