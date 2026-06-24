import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMean } from '../../src/rules/prefer-mean.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-mean', preferMean, {
  valid: [
    'mean(arr);',
    'total / arr.length;',
    'arr.reduce((a, b) => a * b, 0) / arr.length;',
    'arr.reduce((a, b) => a + b, 0) / count;',
    'arr.reduce((a, b) => a + b) / arr.length;',
  ],
  invalid: [
    {
      code: 'arr.reduce((a, b) => a + b, 0) / arr.length;',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'nums.reduce((acc, x) => acc + x, 0) / nums.length;',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'const avg = (nums as number[]).reduce((a, b) => a + b, 0) / nums.length;',
      errors: [{ messageId: 'preferMean' }],
    },
  ],
});
