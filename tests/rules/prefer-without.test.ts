import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferWithout } from '../../src/rules/prefer-without.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-without', preferWithout, {
  valid: [
    'without(arr, value);',
    'arr.filter((x) => x.id !== value);',
    'arr.filter((x) => x === value);',
    'arr.filter((x) => a !== b);',
    'arr.filter((x) => x !== value).map((x) => x.id);',
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'arr.filter((x): x is string => x !== value);',
      options: [{ skipTypePredicate: true }],
    },
    {
      code: 'arr.filter((item): item is number => item !== value);',
      options: [{ skipTypePredicate: true }],
    },
  ],
  invalid: [
    {
      code: 'arr.filter((x) => x !== value);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => value !== x);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'const xs = (arr as number[]).filter((x) => x !== 0);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x): x is string => x !== value);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x): x is string => value !== x);',
      options: [{ skipTypePredicate: false }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value);',
      options: [{ skipTypePredicate: true }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== null);',
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.map((x) => x.id).filter((x) => x !== value);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferWithout' }],
    },
    {
      code: 'arr.filter((x) => x !== value).map((x) => x.id);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferWithout' }],
    },
  ],
});
