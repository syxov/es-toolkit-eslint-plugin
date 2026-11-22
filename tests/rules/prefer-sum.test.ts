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
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
    'arr.reduce((a, b) => a + b, 0).toFixed(2);',
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0).toFixed(2);',
    {
      // prefer-mean owns the division regardless of chain position.
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'always' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-boundaries' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'chain-start' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
    },
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
    {
      code: 'arr.reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0).toFixed(2);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferSum' }],
    },
  ],
});
