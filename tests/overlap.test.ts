import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import plugin from '../src/index.js';

// Runs every rule, opt-in ones included, over snippets and asserts the exact set of rules
// that fire, so two rules never report the same code and a hand-off between rules cannot
// silently drop it.
const linter = new Linter({ configType: 'flat' });
const config: Linter.Config[] = [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { 'es-toolkit': plugin },
    rules: Object.fromEntries(
      Object.keys(plugin.rules).map(name => [`es-toolkit/${name}`, 'error']),
    ),
  },
];

const reportedRules = (code: string) =>
  linter
    .verify(code, config, 'snippet.ts')
    .map(({ ruleId, message }) => ruleId?.replace('es-toolkit/', '') ?? message)
    .sort();

const cases: [code: string, rules: string[]][] = [
  // array
  ['arr.filter(Boolean);', ['prefer-compact']],
  ['arr.filter(x => !b.includes(x));', ['prefer-difference']],
  ['arr.filter(x => b.includes(x));', ['prefer-intersection']],
  ['arr.filter(x => x !== value);', ['prefer-without']],
  // Nil exclusions narrow in TypeScript, and `without` would widen them: the nil predicates own them.
  ['arr.filter(x => x !== null);', ['prefer-is-null']],
  ['arr.filter(x => x !== undefined);', ['prefer-is-undefined']],
  ['arr.filter(x => x != null);', ['prefer-is-not-nil']],
  ['arr.map(f).flat();', ['prefer-flat-map']],
  ['arr.map(f).flat(Infinity);', ['prefer-flat-map-deep']],
  ['arr.flat();', ['prefer-flatten']],
  ['arr.flat(Infinity);', ['prefer-flatten-deep']],
  ['arr[0];', ['prefer-head']],
  ['arr[0] = 1;', []],
  ['arr[arr.length - 1];', ['prefer-last']],
  ['arr.slice(1);', ['prefer-tail']],
  ['arr.slice(0, -1);', ['prefer-initial']],
  ['arr[Math.floor(Math.random() * arr.length)];', ['prefer-sample']],
  ['[...new Set([...a, ...b])];', ['prefer-union']],
  ['[...new Set([...a, ...b, ...c])];', ['prefer-uniq']],
  ['Array.from(new Set(arr));', ['prefer-uniq']],
  ['arr.sort(() => Math.random() - 0.5);', ['prefer-shuffle']],
  ['Object.fromEntries(users.map(u => [u.id, u]));', ['prefer-key-by']],
  ['[...new Map(users.map(u => [u.id, u])).values()];', ['prefer-uniq-by']],
  ['a.map((x, i) => [x, b[i]]);', ['prefer-zip']],
  ['arr.slice(0, n);', ['prefer-take']],
  ['arr.slice(-n);', ['prefer-take-right']],
  // function
  ['arr.map(x => x);', []],
  ['arr.filter(x => x);', ['prefer-compact']],
  ['promise.catch(() => {});', ['prefer-noop']],
  ['clearTimeout(t); t = setTimeout(f, 100);', ['prefer-debounce']],
  // math
  ['Math.min(Math.max(x, 0), 10);', ['prefer-clamp']],
  ['x >= 0 && x < 10;', ['prefer-in-range']],
  ['nums.reduce((a, b) => a + b, 0) / nums.length;', ['prefer-mean']],
  ['a.reduce((s, x) => s + x, 0) / b.length;', ['prefer-sum']],
  [
    'items.reduce((acc, item) => acc + item.value, 0) / items.length;',
    ['prefer-mean-by'],
  ],
  [
    'items.reduce((acc, item) => acc + item.value, 0) / other.length;',
    ['prefer-sum-by'],
  ],
  ['nums.reduce((a, b) => a + b, 0);', ['prefer-sum']],
  ['Math.floor(Math.random() * 10);', ['prefer-random-int']],
  ['const j = Math.floor(Math.random() * arr.length);', ['prefer-random-int']],
  ['a[Math.floor(Math.random() * (a.length - 1))];', ['prefer-random-int']],
  ['Array.from({ length: n }, (_, i) => i);', ['prefer-range']],
  ['[...Array(n).keys()];', ['prefer-range']],
  ['Math.round(x * 100) / 100;', ['prefer-round']],
  ['Number(x.toFixed(2));', []],
  // object
  ['JSON.parse(JSON.stringify(x));', ['prefer-clone-deep']],
  [
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]));',
    ['prefer-map-values'],
  ],
  // predicate
  ['x === null;', ['prefer-is-null']],
  ['x === undefined;', ['prefer-is-undefined']],
  ['x == null;', ['prefer-is-nil']],
  ['x != null;', ['prefer-is-not-nil']],
  ['x === null || x === undefined;', ['prefer-is-nil']],
  ['x !== null && x !== undefined;', ['prefer-is-not-nil']],
  ['let x: unknown; typeof x === "string";', ['prefer-is-string']],
  ['let x: unknown; typeof x === "undefined";', ['prefer-is-undefined']],
  ['Object.keys(o).length === 0;', ['prefer-is-empty']],
  ['JSON.stringify(a) === JSON.stringify(b);', ['prefer-is-equal']],
  [
    'ArrayBuffer.isView(v) && !(v instanceof DataView);',
    ['prefer-is-typed-array'],
  ],
  ['v instanceof Date;', ['prefer-is-date']],
  // promise
  ['new Promise(resolve => setTimeout(resolve, ms));', ['prefer-delay']],
  // string
  ['s[0].toUpperCase() + s.slice(1);', ['prefer-upper-first']],
  ['s.charAt(0).toUpperCase() + s.slice(1);', ['prefer-upper-first']],
  ['`${s[0].toUpperCase()}${s.slice(1)}`;', ['prefer-upper-first']],
  ['s[0].toLowerCase() + s.slice(1);', ['prefer-lower-first']],
  [
    's.charAt(0).toUpperCase() + s.slice(1).toLowerCase();',
    ['prefer-capitalize'],
  ],
  ["s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');", ['prefer-escape-reg-exp']],
  // trim group: both ends belong to prefer-trim, chained one-sided replaces included
  ["s.replace(/^\\/+|\\/+$/g, '');", ['prefer-trim']],
  ["s.replace(/^\\/+/, '').replace(/\\/+$/, '');", ['prefer-trim']],
  ["s.replace(/\\/+$/, '').replace(/^\\/+/, '');", ['prefer-trim']],
  ["s.replace(/^\\/+/, '');", ['prefer-trim-start']],
  ["s.replace(/\\/+$/, '');", ['prefer-trim-end']],
  [
    "s.replace(/^\\/+/, '').replace(/-+$/, '');",
    ['prefer-trim-end', 'prefer-trim-start'],
  ],
  ["s.replace(/^\\/+|\\/+$/, '');", []],
  ["s.replace(/^\\s+|\\s+$/g, '');", []],
  ["s.replace(/^\\//, '');", []],
  ["s.replace(/^[a-z]+/, '');", []],
  ["s?.replace(/\\/+$/, '');", []],
  // head: nil checks of the first element belong to the nil predicate rules
  ['xs[0] == null;', ['prefer-is-nil']],
  ['xs[0] != null;', ['prefer-is-not-nil']],
  ['xs[0] === null;', ['prefer-is-null']],
  ['xs[0] === undefined;', ['prefer-is-undefined']],
  ["typeof xs[0] === 'undefined';", ['prefer-is-undefined']],
  ['color[0]!.toUpperCase() + color.slice(1);', []],
  // collection
  ['[...new Set([...a.keys(), ...b.keys()])];', ['prefer-uniq']],
  ['arr.filter((x): x is string => x !== value);', []],
  ['xs?.filter(x => x !== value);', []],
  ['[a !== b, c].filter(Boolean).length;', []],
  ["params.filter(p => !['{', '}'].includes(p));", []],
  ['words.filter(w => text().includes(w));', []],
  ['i >= 0 && i < xs.length;', []],
  ['[...new Set(code.match(re))];', []],
  // misc: math / function / string false positives
  ['Math.max(0, Math.min(Math.max(s, e), len));', ['prefer-clamp']],
  [
    'const lo = Math.max(Math.min(a, b), 0); const hi = Math.min(Math.max(a, b), n);',
    [],
  ],
  [
    'for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }',
    [],
  ],
  ['groupBy(arr, x => x);', ['prefer-identity']],
  ['const select = (state: State) => state;', []],
  ["vi.spyOn(console, 'error').mockImplementation(() => {});", []],
  ['fn(function save() {});', []],
  ['expect(JSON.parse(JSON.stringify(ast))).toEqual(ast);', []],
  ["s.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');", []],
  ['page.evaluate(() => new Promise(r => setTimeout(r, 100)));', []],
  // slice group
  ['xs.slice(-1)[0];', ['prefer-last']],
  ['xs.slice(-2)[0];', ['prefer-take-right']],
  ["const s = 'abc'; s.slice(-1)[0];", []],
  ['[sx].flat();', []],
  ['[x].map(f).flat();', []],
  // nil / typecheck: one value tested against several types, object probes, undeclared globals
  [
    'let v: unknown; typeof v === "string" || typeof v === "number" || typeof v === "boolean";',
    [],
  ],
  [
    'let v: unknown; typeof v === "number" ? 1 : typeof v === "string" ? 2 : 3;',
    [],
  ],
  ['let v: unknown; typeof v === "number" || v instanceof Date;', []],
  ['v instanceof File || v instanceof Blob;', []],
  ['let x: unknown; typeof x === "undefined" || typeof x === "function";', []],
  ['typeof x === "object" && x !== null;', []],
  ['x != null && typeof x === "object" && "k" in x;', []],
  ['x !== null && x !== undefined && typeof x === "object";', []],
  ['typeof window === "undefined";', []],
  ['typeof requestAnimationFrame === "function";', []],
  ['x === undefined ? d : x;', []],
  ['if (x == null) x = d;', []],
  ['x == null ? undefined : x.y;', []],
  ['expect(typeof o.fire === "function").toBe(true);', []],
];

describe('rule overlap', () => {
  it.each(cases)('%s', (code, rules) => {
    expect(reportedRules(code)).toEqual(rules);
  });
});
