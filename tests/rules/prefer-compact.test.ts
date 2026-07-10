import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferCompact } from '../../src/rules/prefer-compact.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-compact', preferCompact, {
  valid: [
    'compact(arr);',
    'arr.filter((x) => x);',
    'arr.filter((x) => !!y);',
    'arr.filter((x) => Boolean(x.foo));',
    'arr.map(Boolean);',
    'Boolean(x);',
    'arr.filter(Boolean, thisArg);',
    'items.filter(Boolean).map((x) => x.id);',
    'items.map((x) => x.id).filter(Boolean);',
    'items.map((x) => x).filter(Boolean).map((x) => x.id);',
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'items.map((x) => x.id).filter(Boolean);',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'items.map((x) => x).filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'chain-boundaries' }],
    },
  ],
  invalid: [
    {
      code: 'arr.filter(Boolean);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter((x) => !!x);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter((x) => Boolean(x));',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'getList().filter(Boolean);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'const xs = (arr as (string | null)[]).filter((x) => !!x);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.map((x) => x.id).filter(Boolean);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.map((x) => x).filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter(Boolean);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferCompact' }],
    },
  ],
});
