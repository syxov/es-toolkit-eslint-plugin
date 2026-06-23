import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

type MathMethod = 'min' | 'max';

const mathCall = (method: MathMethod) =>
  `CallExpression[callee.object.name="Math"][callee.property.name="${method}"][arguments.length=2]`;

// A clamp is an outer Math call wrapping the opposite Math call as a direct argument:
// Math.min(Math.max(value, lower), upper) or Math.max(Math.min(value, upper), lower).
const clampPattern = (outer: MathMethod, inner: MathMethod) =>
  `${mathCall(outer)}:has(> ${mathCall(inner)})`;

export const preferClamp = createRule({
  name: 'prefer-clamp',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `clamp` from es-toolkit over nested `Math.min`/`Math.max`.',
    },
    schema: [],
    messages: {
      preferClamp: 'Prefer `clamp` from es-toolkit instead of nesting `Math.min`/`Math.max`.',
    },
  },
  defaultOptions: [],
  create(context) {
    const report = (node: TSESTree.CallExpression) =>
      context.report({ node, messageId: 'preferClamp' });

    return {
      [clampPattern('min', 'max')]: report,
      [clampPattern('max', 'min')]: report,
    };
  },
});
