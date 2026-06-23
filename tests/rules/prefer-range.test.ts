import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferRange } from '../../src/rules/prefer-range.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-range', preferRange, {
  valid: [
    'range(5);',
    'Array.from({ length: n });',
    'Array.from({ length: n }, (_, i) => i * 2);',
    'Array.from({ length: n }, (_, i) => _);',
    'Array.from(iterable, (x) => x);',
    '[...arr.keys()];',
  ],
  invalid: [
    {
      code: 'Array.from({ length: n }, (_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'Array.from({ length: 10 }, (_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: '[...Array(n).keys()];',
      errors: [{ messageId: 'preferRange' }],
    },
    {
      code: 'const idx: number[] = Array.from({ length: count }, (_, i) => i);',
      errors: [{ messageId: 'preferRange' }],
    },
  ],
});
