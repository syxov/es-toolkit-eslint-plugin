import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferUniq } from '../../src/rules/prefer-uniq.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-uniq', preferUniq, {
  valid: [
    'uniq(arr);',
    'new Set(arr);',
    '[...arr];',
    'Array.from(arr);',
    'Array.from(new Set(arr), (x) => x * 2);',
    '[...new Set()];',
    '[...new Map(entries)];',
    // A spread-concat of arrays is a union, owned by prefer-union.
    '[...new Set([...a, ...b])];',
    'Array.from(new Set([...a, ...b]));',
  ],
  invalid: [
    {
      code: '[...new Set(arr)];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: 'const u = [...new Set([1, 2, 2, 3])];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: 'Array.from(new Set(arr));',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: 'const u: number[] = [...new Set<number>(nums)];',
      errors: [{ messageId: 'preferUniq' }],
    },
  ],
});
