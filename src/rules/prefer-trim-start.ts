import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  emptyReplaceCalls,
  isInTrimPair,
  trimPatternOf,
} from '../utils/trim-replace.js';

export const preferTrimStart = createRule({
  name: 'prefer-trim-start',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `trimStart` from es-toolkit instead of stripping leading characters with `.replace`.',
    },
    schema: [],
    messages: {
      preferTrimStart:
        'Prefer `trimStart` from es-toolkit instead of stripping leading characters with `.replace`.',
    },
  },
  create(context) {
    return {
      [emptyReplaceCalls](node: TSESTree.CallExpression) {
        if (trimPatternOf(node)?.side === 'start' && !isInTrimPair(node))
          context.report({ node, messageId: 'preferTrimStart' });
      },
    };
  },
});
