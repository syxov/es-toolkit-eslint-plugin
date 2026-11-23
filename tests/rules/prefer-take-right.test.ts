import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTakeRight } from '../../src/rules/prefer-take-right.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-take-right', preferTakeRight, {
  valid: [
    'takeRight(arr, n);',
    'arr.slice(n);',
    // Owned by prefer-tail and prefer-initial.
    'arr.slice(1);',
    'arr.slice(0, -1);',
    'arr.slice(-n, -1);',
    'arr.slice(-n, 2);',
    'arr.slice(+n);',
    'arr.slice(~n);',
    'arr.slice();',
    'arr.slice(...args);',
    'arr.substr(-3);',
    'arr.splice(-3);',
    // String contexts.
    's.slice(-1).toUpperCase();',
    's.slice(-3).toLowerCase();',
    "s.slice(-3) + '…';",
    "'…' + s.slice(-3);",
    'const label = `…${s.slice(-3)}`;',
    // Strings: receiver, result, guard or declaration.
    's.slice(-3).trim() + suffix;',
    '`000${date.getFullYear()}`.slice(-4);',
    "('0' + n).slice(-2);",
    'date.getFullYear().toString().slice(-2);',
    "hiddenTextarea.value.slice(-1) === '\\n';",
    "s.endsWith('/') ? s.slice(-2) : s;",
    'const ext: string = getExt(); ext.slice(-3);',
    // Typed arrays and `Buffer`.
    "const encryptedBuf = Buffer.from(token, 'base64'); encryptedBuf.slice(-16);",
    // `xs.slice(-1)[0]` is the last element: prefer-last owns it.
    'xs.slice(-1)[0];',
    'this.focusables.filter(isDomFocusable).slice(-1)[0];',
  ],
  invalid: [
    { code: 'arr.slice(-n);', errors: [{ messageId: 'preferTakeRight' }] },
    { code: 'arr.slice(-3);', errors: [{ messageId: 'preferTakeRight' }] },
    { code: 'arr.slice(-1);', errors: [{ messageId: 'preferTakeRight' }] },
    {
      code: 'arr.slice(-(a + b));',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: 'items.slice(-count).map(f);',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    { code: 'fn(arr.slice(-2));', errors: [{ messageId: 'preferTakeRight' }] },
    {
      code: 'const last3 = arr.slice(-3);',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: 'const pair = [a.slice(-2), b.slice(-2)];',
      errors: [
        { messageId: 'preferTakeRight' },
        { messageId: 'preferTakeRight' },
      ],
    },
    // Strings outside a recognised string context are still reported.
    {
      code: 'const ext = name.slice(-4);',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    // Not the last element.
    {
      code: 'xs.slice(-2)[0];',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: 'xs.slice(-1)[1];',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: 'const [lastItem] = xs.slice(-1);',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: "const parts = s.split('.'); parts.slice(-2);",
      errors: [{ messageId: 'preferTakeRight' }],
    },
    // TypeScript.
    {
      code: '(arr as number[]).slice(-n);',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: 'arr.slice(-n) as T[];',
      errors: [{ messageId: 'preferTakeRight' }],
    },
    {
      code: 'function lastN<T>(xs: T[], n: number): T[] { return xs.slice(-n); }',
      errors: [{ messageId: 'preferTakeRight' }],
    },
  ],
});
