import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDelay } from '../../src/rules/prefer-delay.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-delay', preferDelay, {
  valid: [
    'delay(1000);',
    'new Promise((resolve) => setTimeout(doWork, 1000));',
    'new Promise((resolve, reject) => setTimeout(resolve, ms));',
    'new Promise((resolve) => { setTimeout(resolve, ms); });',
    'setTimeout(fn, 1000);',
    'new Promise((resolve) => resolve(42));',
  ],
  invalid: [
    {
      code: 'new Promise((resolve) => setTimeout(resolve, 1000));',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'async function sleep(ms) { await new Promise((r) => setTimeout(r, ms)); }',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise<void>((resolve) => setTimeout(resolve, 300));',
      errors: [{ messageId: 'preferDelay' }],
    },
  ],
});
