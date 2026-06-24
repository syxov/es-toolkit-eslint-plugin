import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferSum } from '../../src/rules/prefer-sum.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-sum', preferSum, {
  valid: [
    'sum(arr);',
    'arr.reduce((a, b) => a * b, 0);',
    'arr.reduce((a, b) => a + b);',
    'arr.reduce((a, b) => a.x + b, 0);',
    'arr.reduce((a, b) => a + b, 1);',
    // The surrounding mean expression belongs to prefer-mean.
    'arr.reduce((a, b) => a + b, 0) / arr.length;',
  ],
  invalid: [
    {
      code: 'arr.reduce((a, b) => a + b, 0);',
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((acc, x) => x + acc, 0);',
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'const total = (nums as number[]).reduce((a, b) => a + b, 0);',
      errors: [{ messageId: 'preferSum' }],
    },
  ],
});
