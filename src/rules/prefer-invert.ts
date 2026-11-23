import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  entryMapping,
  frameCallback,
  fromEntriesOfMappedEntries,
} from '../utils/entries-map.js';

export const preferInvert = createRule({
  name: 'prefer-invert',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `invert` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]))`.',
    },
    schema: [],
    messages: {
      preferInvert:
        'Prefer `invert` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfMappedEntries](node: TSESTree.CallExpression) {
        if (entryMapping(context.sourceCode, frameCallback(node)) === 'invert')
          context.report({ node, messageId: 'preferInvert' });
      },
    };
  },
});
