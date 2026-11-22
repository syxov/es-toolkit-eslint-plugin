import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';
import { isSampleIndex } from '../utils/is-sample-index.js';

export const preferSample = createRule({
  name: 'prefer-sample',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `sample` from es-toolkit instead of random-index array access.',
    },
    schema: [],
    messages: {
      preferSample:
        'Prefer `sample` from es-toolkit instead of indexing with a random index.',
    },
  },
  create(context) {
    return {
      'MemberExpression[computed=true]'(node: TSESTree.MemberExpression) {
        if (isSampleIndex(context.sourceCode, node))
          context.report({ node, messageId: 'preferSample' });
      },
    };
  },
});
