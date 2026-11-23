import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  entryFilter,
  fromEntriesOfFilteredEntries,
} from '../utils/entries-filter.js';

export const preferOmitBy = createRule({
  name: 'prefer-omit-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `omitBy` or `omit` from es-toolkit instead of `Object.fromEntries(Object.entries(o).filter(([k, v]) => !pred))`.',
    },
    schema: [],
    messages: {
      preferOmitBy:
        'Prefer `omitBy` from es-toolkit instead of `Object.fromEntries(Object.entries(o).filter(([k, v]) => !pred))`.',
      preferOmit:
        'Prefer `omit` from es-toolkit instead of `Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfFilteredEntries](node: TSESTree.CallExpression) {
        const filter = entryFilter(context.sourceCode, node);
        if (filter === 'omit')
          context.report({ node, messageId: 'preferOmit' });
        else if (filter === 'omitBy')
          context.report({ node, messageId: 'preferOmitBy' });
      },
    };
  },
});
