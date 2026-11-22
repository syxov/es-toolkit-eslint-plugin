import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTake } from '../../src/rules/prefer-take.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-take', preferTake, {
  valid: [
    'take(arr, n);',
    'take(arr, 3);',
    // Owned by prefer-initial.
    'arr.slice(0, -1);',
    'arr.slice(0, -2);',
    'arr.slice(0, -n);',
    'arr.slice(0);',
    'arr.slice();',
    'arr.slice(1, 3);',
    "arr.slice('0', n);",
    'arr.slice(n, 3);',
    'arr.slice(0, n, x);',
    'arr.substring(0, 3);',
    'arr.splice(0, n);',
    // String contexts.
    's.slice(0, 1).toUpperCase();',
    's.slice(0, 3).toLowerCase();',
    "s.slice(0, 3) + '…';",
    "'…' + s.slice(0, 3);",
    'const preview = `${s.slice(0, 3)}…`;',
  ],
  invalid: [
    { code: 'arr.slice(0, n);', errors: [{ messageId: 'preferTake' }] },
    { code: 'arr.slice(0, 3);', errors: [{ messageId: 'preferTake' }] },
    {
      code: 'arr.slice(0, limit + 1);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'this.items.slice(0, n);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'items.slice(0, limit).map(f);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'items.slice(0, n).length - 1;',
      errors: [{ messageId: 'preferTake' }],
    },
    { code: 'fn(arr.slice(0, 2));', errors: [{ messageId: 'preferTake' }] },
    {
      code: 'const first = arr.slice(0, 5);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'function top(xs) { return xs.slice(0, 10); }',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'const pair = [xs.slice(0, 2), ys.slice(0, 3)];',
      errors: [{ messageId: 'preferTake' }, { messageId: 'preferTake' }],
    },
    // A string outside a recognised string context is still reported.
    {
      code: 'const prefix = s.slice(0, 3);',
      errors: [{ messageId: 'preferTake' }],
    },
    // Only direct string contexts are skipped.
    {
      code: 's.slice(0, 3).trim() + suffix;',
      errors: [{ messageId: 'preferTake' }],
    },
    // TypeScript.
    {
      code: '(arr as number[]).slice(0, n);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'arr.slice(0, n) as T[];',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'function firstN<T>(xs: T[], n: number): T[] { return xs.slice(0, n); }',
      errors: [{ messageId: 'preferTake' }],
    },
  ],
});
