import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMeanBy } from '../../src/rules/prefer-mean-by.js';
const ruleTester = new RuleTester();
// Chain position is measured on the `reduce` call. Its parent is always the `/`, so it can
// never have a next call: only "alone" and "chain end" (a previous call) are reachable. The
// denominator must be the `.length` of the same receiver as written, chained or not.
const chained =
  'items.filter((item) => item.active).reduce((total, item) => total + item.price, 0) / items.filter((item) => item.active).length;';
ruleTester.run('prefer-mean-by', preferMeanBy, {
  valid: [
    'meanBy(items, item => item.price);',
    'items.reduce((total, item) => total + item.price, 0) / other.length;',
    'this.items.reduce((acc, i) => acc + i.v, 0) / items.length;',
    'items.reduce((total, item) => total + item.price, 0) / items[length];',
    // The numeric `0` seed is required: the string `'0'` concatenates, and without a seed the
    // accumulator starts as the first item.
    "items.reduce((total, item) => total + item.price, '0') / items.length;",
    'items.reduce((total, item) => total + item.price) / items.length;',
    // A plain sum of the elements is `prefer-mean`.
    'items.reduce((total, item) => total + item, 0) / items.length;',
    'items.reduce((total, item) => total + other.price, 0) / items.length;',
    // `function` callbacks and block bodies are not matched.
    'items.reduce(function (total, item) { return total + item.price; }, 0) / items.length;',
    'items.reduce((total, item) => { return total + item.price; }, 0) / items.length;',
    // The default `outside-chain` skips a chained `reduce`.
    chained,
    { code: chained, options: [{ chainPosition: 'chain-start' }] },
    'items.filter((item) => item.active).reduce((total, item) => total + item.price, 0) / items.length;',
    {
      code: 'items.filter((item) => item.active).reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'always' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((total, item) => total + item.price, 0) / items.length;',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
  ],
  invalid: [
    {
      code: 'this.items.reduce((acc, i) => acc + i.v, 0) / this.items.length;',
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'const avg = (items as Item[]).reduce((acc, i) => acc + i[key], 0) / (items as Item[]).length;',
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: chained,
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: chained,
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'const avg: number = items.reduce((total, item) => item.price + total, 0) / items.length;',
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      // A call on the quotient does not chain the `reduce` itself.
      code: '(items.reduce((total, item) => total + item.price, 0) / items.length).toFixed(2);',
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: '(items.reduce((total, item) => total + item.price, 0) / items.length).toFixed(2);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferMeanBy' }],
    },
    {
      code: 'items.reduce((total, item) => total + item.price, 0) / items.length;',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferMeanBy' }],
    },
  ],
});
