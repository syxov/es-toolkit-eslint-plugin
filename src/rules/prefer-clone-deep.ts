import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

type JsonMethod = 'parse' | 'stringify';

// A non-computed `JSON.<method>(arg)` call with exactly one non-spread argument; `path` is
// the attribute prefix of the call node ('' for the selector subject).
const jsonCall = (path: string, method: JsonMethod) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.object.type="Identifier"][${path}callee.object.name="JSON"][${path}callee.property.name="${method}"][${path}arguments.length=1]:not([${path}arguments.0.type="SpreadElement"])`;

// `JSON.parse(JSON.stringify(x))`: a reviver or replacer changes the round-trip, so only the
// one-argument form of both calls is a plain deep clone.
const jsonRoundTrip = `CallExpression${jsonCall('', 'parse')}${jsonCall('arguments.0.', 'stringify')}`;

export const preferCloneDeep = createRule({
  name: 'prefer-clone-deep',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `cloneDeep` from es-toolkit instead of `JSON.parse(JSON.stringify(x))`.',
    },
    schema: [],
    messages: {
      preferCloneDeep:
        'Prefer `cloneDeep` from es-toolkit instead of a `JSON.parse(JSON.stringify(…))` round-trip.',
    },
  },
  create(context) {
    const report = (node: TSESTree.CallExpression) =>
      context.report({ node, messageId: 'preferCloneDeep' });

    return { [jsonRoundTrip]: report };
  },
});
