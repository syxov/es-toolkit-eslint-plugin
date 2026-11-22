import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferRound } from '../../src/rules/prefer-round.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-round', preferRound, {
  valid: [
    'round(x, 2);',
    'const y = round(price, 3);',
    'Math.round(x);',
    'Math.round(x * 100);',
    // The factors differ.
    'Math.round(x * 100) / 10;',
    'Math.round(x * 100) / 1000;',
    // Not a power of ten, or below 10.
    'Math.round(x * 3) / 3;',
    'Math.round(x * 1) / 1;',
    'Math.round(x * 0.01) / 0.01;',
    'Math.round(x * 1e-2) / 1e-2;',
    // Non-literal factor.
    'Math.round(x * n) / n;',
    'Math.round(x * factor) / 100;',
    // A string literal is not a numeric factor.
    "Math.round(x * '100') / '100';",
    // Wrong operator inside or outside the call.
    'Math.round(x + 100) / 100;',
    'Math.round(x / 100) * 100;',
    'Math.round(x * 100) * 100;',
    'Math.round(x * 100) - 100;',
    // Different rounding method.
    'Math.floor(x * 100) / 100;',
    'Math.ceil(x * 100) / 100;',
    'Math.trunc(x * 100) / 100;',
    // Not `Math.round` by name, or wrong arity.
    'foo.round(x * 100) / 100;',
    'round(x * 100) / 100;',
    'Math.round(x * 100, y) / 100;',
    // `toFixed` alone stays a string.
    'x.toFixed(2);',
    'const label = x.toFixed(2);',
    'String(x.toFixed(2));',
    '`${x.toFixed(2)}`;',
    // `toFixed` with no argument or extra arguments.
    'Number(x.toFixed());',
    'Number(x.toFixed(2, y));',
    '+x.toFixed();',
    // A different method.
    'Number(x.toPrecision(2));',
    'parseFloat(x.toString(2));',
    // A different conversion.
    '-x.toFixed(2);',
    '!x.toFixed(2);',
    'parseInt(x.toFixed(2));',
    'foo.parseFloat(x.toFixed(2));',
    'Number.parseInt(x.toFixed(2));',
    'Number(x.toFixed(2), y);',
    // The `toFixed` call is not the direct argument.
    'Number(x.toFixed(2) + suffix);',
  ],
  invalid: [
    // Shape A: `Math.round(x * F) / F`.
    {
      code: 'Math.round(x * 100) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round(100 * x) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round(x * 10) / 10;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round(price * 1000) / 1000;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round(x * 1e2) / 1e2;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round(x * 100) / 1e2;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round((a + b) * 100) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Math.round(item.price * 100) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
    // Shape B: a `toFixed(n)` result converted back to a number.
    {
      code: 'Number(x.toFixed(2));',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: '+x.toFixed(2);',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'parseFloat(x.toFixed(2));',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Number.parseFloat(x.toFixed(2));',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Number(x.toFixed(digits));',
      errors: [{ messageId: 'preferRound' }],
    },
    // Inside larger expressions.
    {
      code: 'const total = Math.round(subtotal * 100) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'function f(x) { return Number(x.toFixed(2)); }',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'setTotal(Math.round(sum * 100) / 100);',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'const y = +price.toFixed(2) + shipping;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'const a = Math.round(x * 100) / 100, b = parseFloat(y.toFixed(1));',
      errors: [{ messageId: 'preferRound' }, { messageId: 'preferRound' }],
    },
    // TypeScript.
    {
      code: 'Math.round((x as number) * 100) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'Number((x as number).toFixed(2));',
      errors: [{ messageId: 'preferRound' }],
    },
    {
      code: 'const toCents = (n: number): number => Math.round(n * 100) / 100;',
      errors: [{ messageId: 'preferRound' }],
    },
  ],
});
