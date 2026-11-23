import type { TSESTree } from '@typescript-eslint/utils';
import { isEvaluatedInBrowser } from '../utils/browser-evaluation.js';
import { createRule } from '../utils/create-rule.js';
import { isWithTimeoutRace, promiseRace } from '../utils/timer-promise.js';

export const preferWithTimeout = createRule({
  name: 'prefer-with-timeout',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `withTimeout` from es-toolkit instead of racing a promise against a rejecting timer.',
    },
    schema: [],
    messages: {
      preferWithTimeout:
        'Prefer `withTimeout` from es-toolkit instead of racing a promise against a rejecting timer.',
    },
  },
  create(context) {
    return {
      [promiseRace](node: TSESTree.CallExpression) {
        if (
          isWithTimeoutRace(context.sourceCode, node)
          && !isEvaluatedInBrowser(node)
        )
          context.report({ node, messageId: 'preferWithTimeout' });
      },
    };
  },
});
