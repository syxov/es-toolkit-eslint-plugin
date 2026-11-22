import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDelay } from '../../src/rules/prefer-delay.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-delay', preferDelay, {
  valid: [
    'delay(1000);',
    'new Promise((resolve) => setTimeout(doWork, 1000));',
    'new Promise((resolve, reject) => setTimeout(resolve, ms));',
    'new Promise((resolve, reject) => setTimeout(() => resolve(), ms));',
    'new Promise((resolve) => { setTimeout(doWork, ms); });',
    'new Promise((resolve) => { doWork(); setTimeout(resolve, ms); });',
    'setTimeout(fn, 1000);',
    'new Promise((resolve) => resolve(42));',
    // Resolving with a value is more than a delay.
    'new Promise((resolve) => setTimeout(resolve, ms, value));',
    'new Promise((resolve) => setTimeout(() => resolve(value), ms));',
    'new Promise((resolve) => setTimeout(() => { resolve(value); }, ms));',
    // The callback calls something other than the executor's own param.
    'new Promise((resolve) => setTimeout(() => done(), ms));',
    'new Promise((resolve) => setTimeout(() => { done(); }, ms));',
    'new Promise((resolve) => setTimeout(() => obj.resolve(), ms));',
    'new Promise((resolve) => setTimeout(() => { resolve(); doWork(); }, ms));',
    'new Promise((resolve) => setTimeout((x) => resolve(), ms));',
    'new Promise((resolve) => setTimeout(function () { resolve(); }, ms));',
    'new Promise(function (resolve) { setTimeout(doWork, ms); });',
    'new Promise(function (resolve) { doWork(); setTimeout(resolve, ms); });',
    'new Promise(function (resolve, reject) { setTimeout(resolve, ms); });',
    'new Promise((resolve) => setTimeout(resolve));',
    'new Other((resolve) => setTimeout(resolve, ms));',
  ],
  invalid: [
    {
      code: 'new Promise((resolve) => setTimeout(resolve, 1000));',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise((resolve) => { setTimeout(resolve, ms); });',
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
      code: 'new Promise((resolve) => setTimeout(() => resolve(), ms));',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise((resolve) => setTimeout(() => { resolve(); }, ms));',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise((resolve) => { setTimeout(() => resolve(), ms); });',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise(function (resolve) { setTimeout(resolve, ms); });',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise(function (done) { setTimeout(() => done(), ms); });',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'new Promise<void>((resolve) => { setTimeout(resolve, 300); });',
      errors: [{ messageId: 'preferDelay' }],
    },
    {
      code: 'const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));',
      errors: [{ messageId: 'preferDelay' }],
    },
  ],
});
