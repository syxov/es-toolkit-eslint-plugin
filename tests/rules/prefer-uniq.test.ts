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
    // `match` returns `null` without a match: `new Set(null)` is empty, `uniq(null)` throws.
    '[...new Set(code.match(/Chai\\.\\w+/g))];',
    'Array.from(new Set(text.match(re)));',
  ],
  invalid: [
    {
      // Three arrays: `union` takes exactly two, so this is a plain dedupe.
      code: '[...new Set([...a, ...b, ...c])];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: 'Array.from(new Set([...a, ...b, ...c]));',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: '[...new Set([...a, ...b, x])];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: '[...new Set([...a, x])];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: '[...new Set([...a])];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: '[...new Set(arr)];',
      errors: [{ messageId: 'preferUniq' }],
    },
    // Spreads of iterators or Sets are not a `union` of arrays, but still a dedupe.
    {
      code: '[...new Set([...baseline.keys(), ...current.keys()])];',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: 'Array.from(new Set([...Object.keys(previous), ...captured.keys()]));',
      errors: [{ messageId: 'preferUniq' }],
    },
    {
      code: 'const ids: ReadonlySet<string> = load(); [...new Set([...ids, ...b])];',
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
