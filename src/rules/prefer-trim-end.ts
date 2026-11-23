import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  emptyReplaceCalls,
  isInTrimPair,
  trimPatternOf,
} from '../utils/trim-replace.js';

export const preferTrimEnd = createRule({
  name: 'prefer-trim-end',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `trimEnd` from es-toolkit instead of stripping trailing characters with `.replace`.',
    },
    schema: [],
    messages: {
      preferTrimEnd:
        'Prefer `trimEnd` from es-toolkit instead of stripping trailing characters with `.replace`.',
    },
  },
  create(context) {
    return {
      [emptyReplaceCalls](node: TSESTree.CallExpression) {
        if (trimPatternOf(node)?.side === 'end' && !isInTrimPair(node))
          context.report({ node, messageId: 'preferTrimEnd' });
      },
    };
  },
});
