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
  [
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v]));',
    ['prefer-map-keys'],
  ],
  [
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));',
    ['prefer-invert'],
  ],
  // A plain copy, a callback that changes both, a key not taken from the old key.
  ['Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v]));', []],
  ['Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), g(v)]));', []],
  ['Object.fromEntries(Object.entries(o).map(([k, v]) => [v.id, v]));', []],
  ['Object.fromEntries(Object.entries(o).map(([k, v]) => [v, f(k)]));', []],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v > 0));',
    ['prefer-pick-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([k]) => keys.includes(k)));',
    ['prefer-pick-by'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([k]) => k === 'a'));",
    ['prefer-pick-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !!v));',
    ['prefer-pick-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !v));',
    ['prefer-omit-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));',
    ['prefer-omit-by'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'a'));",
    ['prefer-omit-by'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'a' && k !== 'b'));",
    ['prefer-omit-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([k]) => !a.has(k) && !isB(k)));',
    ['prefer-omit-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => !keys.includes(k) && v));',
    ['prefer-pick-by'],
  ],
  // A single nil check goes to the nil rule first; `pickBy(o, isNotNil)` follows once it reads
  // `isNotNil(v)`.
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v != null));',
    ['prefer-is-not-nil'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));',
    ['prefer-is-undefined'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v !== 'undefined'));",
    ['prefer-is-undefined'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null));',
    ['prefer-is-null'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined));',
    ['prefer-is-not-nil'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !(v == null)));',
    ['prefer-is-nil'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => isNotNil(v)));',
    ['prefer-pick-by'],
  ],
  // Single type tests go to the type predicate rule first, like nil checks.
  [
    "Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === 'string'));",
    ['prefer-is-string'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v !== 'function'));",
    ['prefer-is-function'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !(v instanceof Date)));',
    ['prefer-is-date'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => isString(v)));',
    ['prefer-pick-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !isDate(v)));',
    ['prefer-omit-by'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === 'string' || typeof v === 'number'));",
    ['prefer-pick-by'],
  ],
  [
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v instanceof Widget));',
    ['prefer-pick-by'],
  ],
  // Compound predicates: the frame and the nil check or type test inside are separate rewrites.
  [
    "Object.fromEntries(Object.entries(o).filter(([k, v]) => typeof v === 'string' && k !== 'x'));",
    ['prefer-is-string', 'prefer-pick-by'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([k, v]) => v != null && k !== 'x'));",
    ['prefer-is-not-nil', 'prefer-pick-by'],
  ],
  [
    "Object.fromEntries(Object.entries(o).filter(([k, v]) => v == null || k === 'x'));",
    ['prefer-is-nil', 'prefer-pick-by'],
  ],
  ['Object.keys(o).find(k => o[k] === value);', ['prefer-find-key']],
  ["Object.keys(o).find(k => k.startsWith('x'));", []],
  ['Object.entries(o).find(([, v]) => v === value)?.[0];', ['prefer-find-key']],
  ['Object.entries(o).find(([, v]) => v === value)[0];', ['prefer-find-key']],
  ['Object.entries(o).find(([, v]) => v === value)[1];', []],
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
