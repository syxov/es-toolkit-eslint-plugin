import type { TSESTree } from '@typescript-eslint/utils';
import { isWriteTarget } from '../utils/ast.js';
import { createRule } from '../utils/create-rule.js';
import { caseConversionReceiver } from '../utils/selectors.js';

// `raw` rather than `value`: esquery compares values as strings, so `obj["0"]` would match too.
const firstIndex = `MemberExpression[computed=true][property.type="Literal"][property.raw="0"]:not(${caseConversionReceiver})`;

export const preferHead = createRule({
  name: 'prefer-head',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using `head` from es-toolkit instead of `arr[0]`.',
    },
    schema: [],
    messages: {
      preferHead: 'Prefer `head` from es-toolkit instead of indexing with `0`.',
    },
  },
  create(context) {
    return {
      [firstIndex](node: TSESTree.MemberExpression) {
        if (!isWriteTarget(node))
          context.report({ node, messageId: 'preferHead' });
      },
    };
  },
});
