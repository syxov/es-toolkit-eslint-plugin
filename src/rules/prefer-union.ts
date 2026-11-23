import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  isArrayUnion,
  roundTripOf,
  setRoundTrip,
} from '../utils/set-round-trip.js';

export const preferUnion = createRule({
  name: 'prefer-union',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `union` from es-toolkit instead of deduplicating two concatenated arrays through `new Set`.',
    },
    schema: [],
    messages: {
      preferUnion:
        'Prefer `union` from es-toolkit instead of round-tripping concatenated arrays through `new Set`.',
    },
  },
  create(context) {
    return {
      // `[...a, ...b]` with exactly two array spreads, matching `union(arr1, arr2)`.
      [setRoundTrip](set: TSESTree.NewExpression) {
        if (isArrayUnion(context.sourceCode, set.arguments[0]))
          context.report({ node: roundTripOf(set), messageId: 'preferUnion' });
      },
    };
  },
});
