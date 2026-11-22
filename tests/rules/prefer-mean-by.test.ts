import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMeanBy } from '../../src/rules/prefer-mean-by.js';
const ruleTester = new RuleTester();
// Chain position is measured on the `reduce` call. The rule requires its receiver to be the
// same identifier as the `.length` object, and the `/` is its parent, so the `reduce` is never
// part of a chain: every chainPosition reports the plain form, and chained forms never match.
ruleTester.run('prefer-mean-by', preferMeanBy, {
  valid: [
    'meanBy(items, item => item.price);',
    'items.reduce((total, item) => total + item.price, 0) / other.length;',
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
