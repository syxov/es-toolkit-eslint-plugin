import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTail } from '../../src/rules/prefer-tail.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-tail', preferTail, {
  valid: [
    'tail(arr);',
    'arr.slice(2);',
    'arr.slice(1, 3);',
    'arr.slice();',
    "arr.slice('1');",
    'arr.slice(-1);',
    // String contexts.
    's.slice(1).toLowerCase();',
    's.slice(1).toUpperCase();',
    's.slice(1).toLocaleLowerCase();',
    's.slice(1).toLocaleUpperCase();',
    's[0].toUpperCase() + s.slice(1);',
    's.slice(1) + suffix;',
    'const label = `#${id.slice(1)}`;',
    // The receiver is visibly a string.
    "'abc'.slice(1);",
    '`#${id}`.slice(1);',
    'x.toString().slice(1);',
    "(useAttrMap.href || '').slice(1);",
    "(href ?? '').slice(1);",
    'String(x).slice(1);',
    'JSON.stringify(x).slice(1);',
    "s.split('/')[1].slice(1);",
    'el.textContent.slice(1);',
    'location.hash.slice(1);',
    'window.location.search.slice(1);',
    'value.trim().slice(1);',
    // The result is read as a string.
    's.slice(1).trim();',
    's.slice(1).trim() + suffix;',
    "s.slice(1).split(',');",
    "s.slice(1) === 'x';",
    'parseInt(s.slice(1), 10);',
    'JSON.parse(s.slice(1));',
    'out += s.slice(1);',
    "c ? s.slice(1) : '';",
    "s.slice(1) || 'default';",
    // The same receiver is tested as a string next to it.
    "key.startsWith('_') ? key.slice(1) : key;",
    "if (p.startsWith('/')) p = p.slice(1);",
    "if (p.startsWith('/')) { return p.slice(1); }",
    "const name = p => (p.charAt(0) === '@' ? p.slice(1) : p);",
    // The in-file declaration shows a string.
    "const ENTRY_PATH = '/entry'; ENTRY_PATH.slice(1);",
    'const s: string = get(); s.slice(1);',
    'function f(s: string) { return s.slice(1); }',
    'function f(s?: string | null) { return s?.slice(1); }',
    "function f(s = '') { return s.slice(1); }",
    "const { a = '' } = o; a.slice(1);",
    "const [head, rest] = s.split(','); rest.slice(1);",
    'const [, group] = s.match(re); group.slice(1);',
    "const [value, setValue] = useState(''); value.slice(1);",
    'const [value, setValue] = React.useState<string>(); value.slice(1);',
    "const [value, setValue] = useState(''); setValue(previous => previous.slice(1));",
    "let id = 'x' + n; id = id.slice(1);",
    // Typed arrays and `Buffer`.
    'const a = new Int32Array(4); a.slice(1);',
    'const b = Buffer.from(s); b.slice(1);',
    'Buffer.concat(chunks).slice(1);',
    'function f(bytes: Uint8Array) { return bytes.slice(1); }',
  ],
  invalid: [
    { code: 'arr.slice(1);', errors: [{ messageId: 'preferTail' }] },
    {
      code: 'const values: number[] = items.slice(1);',
      errors: [{ messageId: 'preferTail' }],
    },
    { code: 'fn(args.slice(1));', errors: [{ messageId: 'preferTail' }] },
    {
      code: 'args.slice(1).map(f);',
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: 'args.slice(1).length - 1;',
      errors: [{ messageId: 'preferTail' }],
    },
    // Nothing shows a string.
    {
      code: 'const rest = s.slice(1);',
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: "const parts = s.split('/'); parts.slice(1);",
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: "const xs = ['a', 'b']; xs.slice(1);",
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: 'function f(xs: string[]) { return xs.slice(1); }',
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: 'const [items, setItems] = useState([]); setItems(previous => previous.slice(1));',
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: "args.slice(1).join(' ');",
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: 'if (xs.length > 1) xs = xs.slice(1);',
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: "const s = 'a'; function f(s) { return s.slice(1); }",
      errors: [{ messageId: 'preferTail' }],
    },
    {
      code: 'node.children.slice(1);',
      errors: [{ messageId: 'preferTail' }],
    },
  ],
});
