import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { objectFromEntries } from '../utils/entries-map.js';
import { isKeyEntryMap, keyEntryMap } from '../utils/key-entry-callback.js';

// `Object.fromEntries(xs.map(p => [key, p]))`, with the map call as its only argument.
const fromEntriesOfKeyEntryMap = `${objectFromEntries}${keyEntryMap('arguments.0.')}`;

export const preferKeyBy = createRule({
  name: 'prefer-key-by',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `keyBy` from es-toolkit instead of `Object.fromEntries(xs.map(x => [key, x]))`.',
    },
    schema: [],
    messages: {
      preferKeyBy:
        'Prefer `keyBy` from es-toolkit instead of `Object.fromEntries(xs.map(x => [key, x]))`.',
    },
  },
  create(context) {
    return {
      [fromEntriesOfKeyEntryMap](node: TSESTree.CallExpression) {
        if (isKeyEntryMap(context.sourceCode, node.arguments[0]))
          context.report({ node, messageId: 'preferKeyBy' });
      },
    };
  },
});
