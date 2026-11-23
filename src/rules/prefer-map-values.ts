import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  entryMapping,
  frameCallback,
  fromEntriesOfMappedEntries,
} from '../utils/entries-map.js';

export const preferMapValues = createRule({
  name: 'prefer-map-values',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `mapValues` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))`.',
    },
    schema: [],
    messages: {
      preferMapValues:
        'Prefer `mapValues` from es-toolkit instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfMappedEntries](node: TSESTree.CallExpression) {
        if (entryMapping(context.sourceCode, frameCallback(node)) === 'values')
          context.report({ node, messageId: 'preferMapValues' });
      },
    };
  },
});
