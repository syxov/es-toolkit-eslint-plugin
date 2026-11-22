import type { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils/create-rule.js';

// A non-computed `<object>.<method>(…)` call with exactly one argument.
const methodCall = (object: string, method: string) =>
  `CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.object.name="${object}"][callee.property.name="${method}"][arguments.length=1]`;

// Shape A: `Math.round(x * F) / F`. The selector requires a literal divisor and a product
// with a literal operand; `isScaledByOwnFactor` checks that both factors are the same power
// of ten.
const scaledRound =
  'BinaryExpression[operator="/"][right.type="Literal"][left.type="CallExpression"][left.callee.type="MemberExpression"][left.callee.computed=false][left.callee.object.name="Math"][left.callee.property.name="round"][left.arguments.length=1][left.arguments.0.type="BinaryExpression"][left.arguments.0.operator="*"]';

// Shape B: a `x.toFixed(n)` string converted back to a number.
const toFixed =
  'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.name="toFixed"][arguments.length=1]';
const globalConversion = `CallExpression[callee.type="Identifier"][callee.name=/^(Number|parseFloat)$/][arguments.length=1]:has(> ${toFixed})`;
const numberParseFloat = `${methodCall('Number', 'parseFloat')}:has(> ${toFixed})`;
const unaryPlus = `UnaryExpression[operator="+"]:has(> ${toFixed})`;

// `10`, `100`, `1e2`, … as a number; `1`, `0.01`, `3` and string literals do not count.
const powerOfTenValue = (node: TSESTree.Node) =>
  node.type === 'Literal'
  && typeof node.value === 'number'
  && /^10+$|^1e\+\d+$/.test(String(node.value))
    ? node.value
    : undefined;

const isScaledByOwnFactor = ({ left, right }: TSESTree.BinaryExpression) => {
  const factor = powerOfTenValue(right);
  if (factor === undefined || left.type !== 'CallExpression') return false;
  const [product] = left.arguments;
  return (
    product.type === 'BinaryExpression'
    && (powerOfTenValue(product.left) === factor
      || powerOfTenValue(product.right) === factor)
  );
};

export const preferRound = createRule({
  name: 'prefer-round',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using `round` from es-toolkit instead of `Math.round(x * 10 ** n) / 10 ** n` or a `toFixed` round-trip.',
    },
    schema: [],
    messages: {
      preferRound:
        'Prefer `round` from es-toolkit instead of scaling `Math.round` or converting a `toFixed` string back to a number.',
    },
  },
  create(context) {
    const report = (node: TSESTree.Node) =>
      context.report({ node, messageId: 'preferRound' });

    return {
      [scaledRound]: (node: TSESTree.BinaryExpression) => {
        if (isScaledByOwnFactor(node)) report(node);
      },
      [globalConversion]: report,
      [numberParseFloat]: report,
      [unaryPlus]: report,
    };
  },
});
