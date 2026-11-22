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
    // The default `outside-chain` skips a chained `reduce`.
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
    // The denominator must be the `.length` of the reduce receiver, as written.
    'a.reduce((s, x) => s + x, 0) / b.length;',
    'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.length;',
    'arr.filter(Boolean).map(Number).reduce((a, b) => a + b, 0) / arr.length;',
    'arr.reduce((a, b) => a + b, 0) / arr[length];',
    'this.items.reduce((a, b) => a + b, 0) / items.length;',
    // A numeric `0` seed or no seed; the string `'0'` concatenates instead.
    "arr.reduce((a, b) => a + b, '0') / arr.length;",
    'arr.reduce((a, b) => a + b, 1) / arr.length;',
    // Not the reducer's own params, or not a sum.
    'arr.reduce((a, b) => a + c, 0) / arr.length;',
    'arr.reduce((a, b) => a - b, 0) / arr.length;',
    // `function` callbacks and block bodies are not matched.
    'arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;',
    'arr.reduce((a, b) => { return a + b; }, 0) / arr.length;',
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
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
      code: 'const avg = (nums as number[]).reduce((a, b) => a + b, 0) / (nums as number[]).length;',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      // Type-only wrappers are ignored when comparing receivers.
      code: 'const avg = (nums as number[]).reduce((a, b) => a + b, 0) / nums!.length;',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      // `mean([])` is NaN, where a seedless reduce throws on an empty array.
      code: 'arr.reduce((a, b) => a + b) / arr.length;',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'this.items.reduce((a, b) => a + b, 0) / this.items.length;',
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'data.values.reduce((acc, x) => x + acc, 0) / data.values.length;',
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
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
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
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.reduce((a, b) => a + b, 0) / arr.length;',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
      errors: [{ messageId: 'preferMean' }],
    },
    {
      code: 'arr.map((x) => x.value).reduce((a, b) => a + b, 0) / arr.map((x) => x.value).length;',
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferMean' }],
    },
  ],
});
