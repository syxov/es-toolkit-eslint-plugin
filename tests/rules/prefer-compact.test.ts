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
      code: 'items.filter(Boolean).map((x) => x.id);',
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
  ],
});
