import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferClamp } from '../../src/rules/prefer-clamp.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-clamp', preferClamp, {
  valid: [
    'clamp(value, 0, 100);',
    'Math.min(a, b);',
    'Math.max(a, b);',
    'Math.min(Math.min(a, b), c);',
    'Math.max(Math.max(a, b), c);',
    'Math.floor(Math.max(a, b));',
    'Math.min(Math.max(a, b, c), d);',
    // One-argument calls are not a two-bound clamp.
    'Math.min(Math.max(a));',
    'Math.min(Math.max(a, b));',
    'Math.min(Math.max(a), b);',
    'Math.min(Math.max(...values), upper);',
    'Math.min(Math.max(a, b), c, d);',
    // The inner call is not a direct argument.
    'Math.min(round(Math.max(a, b)), c);',
    'Math.min(Math.max(a, b) + 1, c);',
    // Not `Math.min`/`Math.max` by name.
    'Math.min(Math.abs(a, b), c);',
    'Math.min(other.max(a, b), c);',
    "Math['min'](Math.max(a, b), c);",
    'Math.min(Math.max, c);',
  ],
  invalid: [
    {
      code: 'Math.min(Math.max(value, lower), upper);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.max(Math.min(value, upper), lower);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.min(upper, Math.max(value, lower));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.max(lower, Math.min(value, upper));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.min(Math.max(x, getMin()), getMax());',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'const y = Math.min(Math.max(x, 0), 1) + 2;',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'const v: number = Math.min(Math.max(x as number, 0), 100);',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'const clampPct = (n: number): number => Math.max(0, Math.min(n!, 100));',
      errors: [{ messageId: 'preferClamp' }],
    },
    {
      code: 'Math.min(Math.max(a, lo), Math.max(b, lo));',
      errors: [{ messageId: 'preferClamp' }],
    },
  ],
});
