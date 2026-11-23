import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  isArrayUnion,
  isMatchCall,
  roundTripOf,
  setRoundTrip,
} from '../utils/set-round-trip.js';

export const preferUniq = createRule({
  name: 'prefer-uniq',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `uniq` from es-toolkit instead of `new Set` round-trips.',
    },
    schema: [],
    messages: {
      preferUniq:
        'Prefer `uniq` from es-toolkit instead of round-tripping through `new Set`.',
    },
  },
  create(context) {
    return {
      // `new Set([...a, ...b])` over two arrays is a union, owned by `prefer-union`.
      [setRoundTrip](set: TSESTree.NewExpression) {
        const [values] = set.arguments;
        if (!isArrayUnion(context.sourceCode, values) && !isMatchCall(values))
          context.report({ node: roundTripOf(set), messageId: 'preferUniq' });
      },
    };
  },
});
