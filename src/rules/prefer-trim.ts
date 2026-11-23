import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  emptyReplaceCalls,
  isTrimPair,
  trimPatternOf,
} from '../utils/trim-replace.js';

export const preferTrim = createRule({
  name: 'prefer-trim',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `trim` from es-toolkit instead of stripping characters from both ends with `.replace`.',
    },
    schema: [],
    messages: {
      preferTrim:
        'Prefer `trim` from es-toolkit instead of stripping characters from both ends with `.replace`.',
    },
  },
  create(context) {
    return {
      [emptyReplaceCalls](node: TSESTree.CallExpression) {
        if (trimPatternOf(node)?.side === 'both' || isTrimPair(node))
          context.report({ node, messageId: 'preferTrim' });
      },
    };
  },
});
