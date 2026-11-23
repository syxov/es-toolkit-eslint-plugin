import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  entryMapping,
  frameCallback,
  fromEntriesOfMappedEntries,
} from '../utils/entries-map.js';

export const preferMapKeys = createRule({
  name: 'prefer-map-keys',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `mapKeys` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v]))`.',
    },
    schema: [],
    messages: {
      preferMapKeys:
        'Prefer `mapKeys` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v]))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfMappedEntries](node: TSESTree.CallExpression) {
        if (entryMapping(context.sourceCode, frameCallback(node)) === 'keys')
          context.report({ node, messageId: 'preferMapKeys' });
      },
    };
  },
});
