import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

type MathMethod = 'min' | 'max';

const mathCall = (method: MathMethod) =>
  `CallExpression[callee.object.name="Math"][callee.property.name="${method}"][arguments.length=2]`;

// A clamp is an outer Math call wrapping the opposite Math call as exactly one direct argument:
// Math.min(Math.max(value, lower), upper) or Math.max(Math.min(value, upper), lower).
// With both arguments wrapped (`Math.max(Math.min(a, b), Math.min(c, d))`) it is a symmetric
// min/max such as an interval-overlap test, and is not equivalent to `clamp` when lower > upper.
const clampPattern = (outer: MathMethod, inner: MathMethod) =>
  `${mathCall(outer)}:has(> ${mathCall(inner)}):not(:has(> ${mathCall(inner)} ~ ${mathCall(inner)}))`;

export const preferClamp = createRule({
  name: 'prefer-clamp',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `clamp` from es-toolkit instead of nested `Math.min`/`Math.max`.',
    },
    schema: [],
    messages: {
      preferClamp:
        'Prefer `clamp` from es-toolkit instead of nesting `Math.min`/`Math.max`.',
    },
  },
  create(context) {
    const report = (node: TSESTree.CallExpression) =>
      context.report({ node, messageId: 'preferClamp' });

    return {
      [clampPattern('min', 'max')]: report,
      [clampPattern('max', 'min')]: report,
    };
  },
});
