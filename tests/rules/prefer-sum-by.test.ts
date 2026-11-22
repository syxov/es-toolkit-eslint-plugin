import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferSumBy } from '../../src/rules/prefer-sum-by.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-sum-by', preferSumBy, {
  valid: [
    'sumBy(items, item => item.value);',
    'items.reduce((acc, item) => acc + item.value, 1);',
    // The surrounding meanBy expression belongs to prefer-mean-by.
    'items.reduce((acc, item) => acc + item.value, 0) / items.length;',
    'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
    'items.reduce((acc, item) => acc + item.value, 0).toFixed(2);',
    'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0).toFixed(2);',
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-boundaries' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'chain-start' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
    },
  ],
  invalid: [
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0);',
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'const total: number = items.reduce((acc, item) => item.value + acc, 0);',
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'outside-chain' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.reduce((acc, item) => acc + item.value, 0).toFixed(2);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-end' } },
      },
      errors: [{ messageId: 'preferSumBy' }],
    },
    {
      code: 'items.filter((item) => item.active).reduce((acc, item) => acc + item.value, 0);',
      options: [{ chainPosition: 'chain-end' }],
      settings: {
        'es-toolkit': { arrayMethods: { chainPosition: 'chain-start' } },
      },
      errors: [{ messageId: 'preferSumBy' }],
    },
  ],
});
