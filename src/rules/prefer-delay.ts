import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// `new Promise(resolve => setTimeout(resolve, ms))` — a single-param executor whose
// expression body is a two-argument `setTimeout` whose first argument is an identifier.
const promisifiedTimeout =
  'NewExpression[callee.name="Promise"][arguments.length=1] > ArrowFunctionExpression[params.length=1][params.0.type="Identifier"][body.callee.name="setTimeout"][body.arguments.length=2][body.arguments.0.type="Identifier"]';

export const preferDelay = createRule({
  name: 'prefer-delay',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `delay` from es-toolkit over `new Promise` + `setTimeout`.',
    },
    schema: [],
    messages: {
      preferDelay:
        'Prefer `delay` from es-toolkit instead of wrapping `setTimeout` in a `new Promise`.',
    },
  },
  create(context) {
    return {
      [promisifiedTimeout](node: TSESTree.ArrowFunctionExpression) {
        const [param] = node.params;
        const { body } = node;
        // Confirm the timeout callback IS the promise's own `resolve` (a pure delay).
        if (body.type !== 'CallExpression') return;
        const [callback] = body.arguments;
        if (
          param.type === 'Identifier'
          && callback.type === 'Identifier'
          && param.name === callback.name
        ) {
          context.report({ node: node.parent, messageId: 'preferDelay' });
        }
      },
    };
  },
});
