import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferSum } from '../../src/rules/prefer-sum.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-sum', preferSum, {
  valid: [
    // A type cast does not change the receiver, so this is a mean.
    '(nums as number[]).reduce((a, b) => a + b, 0) / nums.length;',
    'sum(arr);',
    'arr.reduce((a, b) => a * b, 0);',
    // A numeric `0` seed or no seed; the string `'0'` concatenates instead.
    "arr.reduce((a, b) => a + b, '0');",
    'arr.reduce((a, b) => a + b, null);',
    'arr.reduce((a, b) => a + b, 0, extra);',
    // `function` callbacks and block bodies are not matched.
    'arr.reduce(function (a, b) { return a + b; }, 0);',
    'arr.reduce((a, b) => { return a + b; }, 0);',
    'arr.reduce((a, b) => a.x + b, 0);',
    'arr.reduce((a, b) => a + b, 1);',
    // The surrounding mean expression belongs to prefer-mean.
    'arr.reduce((a, b) => a + b, 0) / arr.length;',
    'arr.reduce((a, b) => a + b) / arr.length;',
    'this.items.reduce((a, b) => a + b, 0) / this.items.length;',
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0);',
    'arr.reduce((a, b) => a + b, 0).toFixed(2);',
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0).toFixed(2);',
    {
      // prefer-mean owns the division regardless of chain position.
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
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
      // Without a seed `reduce` throws on an empty array; `sum([])` returns 0.
      code: 'arr.reduce((a, b) => a + b);',
      errors: [{ messageId: 'preferSum' }],
    },
    {
      // Divided by a different array's length: not a mean, so the sum is reported.
      code: 'a.reduce((s, x) => s + x, 0) / b.length;',
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b) / other.length;',
      errors: [{ messageId: 'preferSum' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0) / arr[length];',
      errors: [{ messageId: 'preferSum' }],
    },
    {
      // The mapped array is not `arr` as written, so this is a sum in a chain.
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferSum' }],
    },
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
