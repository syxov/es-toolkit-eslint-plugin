import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { memberFunction } from '../utils/selectors.js';

const syncFunction =
  ':matches(ArrowFunctionExpression, FunctionExpression)[async=false][generator=false]';

const emptyBody = '[body.type="BlockStatement"][body.body.length=0]';

// With an empty block body, a pattern can only be a direct child of the function as a param.
const plainParams =
  ':not(:has(> :matches(AssignmentPattern, ObjectPattern, ArrayPattern, RestElement[argument.type!="Identifier"])))';

// A parameter annotation can be the only declaration of the function's type; `noop` takes no
// arguments, so calls with one would stop type-checking. A `this` parameter is not an argument.
const untypedParams =
  ':not(:has(> :matches(Identifier[name!="this"], RestElement)[typeAnnotation]))';

// Test doubles: `vi.spyOn(console, 'error').mockImplementation(() => {})`.
const mockArgument =
  'CallExpression[callee.property.name=/^mock(Implementation|ReturnValue)(Once)?$/] > .arguments';

// A named function expression keeps its name observable (`fn.name`, mock names, action logs).
const emptyFunction = `${syncFunction}${emptyBody}${plainParams}${untypedParams}:not(FunctionExpression[id], ${memberFunction}, ${mockArgument})`;

export const preferNoop = createRule({
  name: 'prefer-noop',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `noop` from es-toolkit instead of an inline `() => {}` function.',
    },
    schema: [],
    messages: {
      preferNoop:
        'Prefer `noop` from es-toolkit instead of an inline `() => {}` function.',
    },
  },
  create(context) {
    const report = (
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ) => context.report({ node, messageId: 'preferNoop' });

    return { [emptyFunction]: report };
  },
});
