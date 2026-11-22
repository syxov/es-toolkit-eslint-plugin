import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMean } from '../../src/rules/prefer-mean.js';

const ruleTester = new RuleTester();

// Chain position is measured on the `reduce` call. Its parent is always the `/`, so it can
// never have a next call: only "alone" and "chain end" (a previous call) are reachable.
ruleTester.run('prefer-mean', preferMean, {
  valid: [
    'mean(arr);',
    'total / arr.length;',
    'arr.reduce((a, b) => a * b, 0) / arr.length;',
    'arr.reduce((a, b) => a + b, 0) / count;',
    'arr.reduce((a, b) => a + b) / arr.length;',
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
    'arr.filter(Boolean).map(Number).reduce((a, b) => a + b, 0) / arr.length;',
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-start' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
    },
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
    {
      // A call on the quotient does not chain the `reduce` itself.
      code: '(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: '(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferMean' }],
    },
  ],
});
