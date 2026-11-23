import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import {
  entryFilter,
  fromEntriesOfFilteredEntries,
} from '../utils/entries-filter.js';

export const preferPickBy = createRule({
  name: 'prefer-pick-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `pickBy` or `pick` from es-toolkit instead of `Object.fromEntries(Object.entries(o).filter(([k, v]) => pred))`.',
    },
    schema: [],
    messages: {
      preferPickBy:
        'Prefer `pickBy` from es-toolkit instead of `Object.fromEntries(Object.entries(o).filter(([k, v]) => pred))`.',
      preferPick:
        'Prefer `pick` from es-toolkit instead of `Object.fromEntries(Object.entries(o).filter(([k]) => keys.includes(k)))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfFilteredEntries](node: TSESTree.CallExpression) {
        const filter = entryFilter(context.sourceCode, node);
        if (filter === 'pick')
          context.report({ node, messageId: 'preferPick' });
        else if (filter === 'pickBy')
          context.report({ node, messageId: 'preferPickBy' });
      },
    };
  },
});
