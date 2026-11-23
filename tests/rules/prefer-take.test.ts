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
    // Strings: receiver, result, guard or declaration.
    'date.toISOString().slice(0, 10);',
    "createHash('sha1').update(s).digest('hex').slice(0, 8);",
    "underscore > 0 ? id.slice(0, underscore) : 'Item';",
    "valueStr.slice(0, valueStr.indexOf('(')).trim();",
    'parseFloat(value.slice(0, numberEnd));',
    'function f(value: string) { const number = value.slice(0, numberEnd); }',
    "const slug = 'abc'; slug.slice(0, 2);",
    "const [, rest = ''] = s.split(':'); rest.slice(0, 3);",
    'const url = new URL(href); url.pathname.slice(0, n);',
    // Typed arrays and `Buffer`.
    'const succStart = new Int32Array(n + 1); const sf = succStart.slice(0, n);',
    'const buffer = Buffer.alloc(8); body += buffer.slice(0, bytes);',
    'const [body, setBody] = useState<Uint8Array | null>(null); body.slice(0, 100);',
    // `xs.slice(0, xs.length - k)` drops from the end: `initial` / `dropRight`.
    'xs.slice(0, xs.length - 1);',
    'errorMessage.slice(0, errorMessage.length - linkText.length);',
    // A runtime-negative end.
    'points.slice(0, railEndIsAdjacent ? -2 : -1);',
    // Half of a splice or a rotation.
    '[...list.slice(0, before), item, ...list.slice(before)];',
    '[story, ...items.slice(0, index), ...items.slice(index + 1)];',
    'const rotated = [...array.slice(amount), ...array.slice(0, amount)];',
    's.slice(0, 3).trim() + suffix;',
    'this.list = [...this.list.slice(0, i), item, ...this.list.slice(i + 1)];',
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
    // A different array's length is a plain count.
    {
      code: 'xs.slice(0, ys.length - 1);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'xs.slice(0, c ? n : m);',
      errors: [{ messageId: 'preferTake' }],
    },
    // Independent slices of the same array: a takeRight half or the other branch.
    {
      code: '[...lines.slice(0, n), sep, ...lines.slice(-n)];',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'calls = n < 0 ? calls.slice(n) : calls.slice(0, n);',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: '[...a.slice(0, i), ...b.slice(i)];',
      errors: [{ messageId: 'preferTake' }],
    },
    {
      code: 'const rows = data.split("\\n"); rows.slice(0, 10);',
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
