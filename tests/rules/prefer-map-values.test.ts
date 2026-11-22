import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMapValues } from '../../src/rules/prefer-map-values.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-map-values', preferMapValues, {
  valid: [
    'mapValues(o, v => v * 2);',
    'mapValues(o, (v, k) => f(v, k));',
    // The value is copied unchanged: a plain copy, not a mapping.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v]));',
    'Object.fromEntries(Object.entries(o).map(function ([k, v]) { return [k, v]; }));',
    // Keys are swapped or transformed: invert / mapKeys territory.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), g(v)]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, f(v)]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [other, f(v)]));',
    // The key is a member access, not the destructured key.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k.id, f(v)]));',
    // Callback parameter shapes that are not a single `[k, v]` pattern.
    'Object.fromEntries(Object.entries(o).map(([k, v], i) => [k, v + i]));',
    'Object.fromEntries(Object.entries(o).map((entry) => [entry[0], f(entry[1])]));',
    'Object.fromEntries(Object.entries(o).map(([k]) => [k, 1]));',
    'Object.fromEntries(Object.entries(o).map(([k, v, x]) => [k, v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v, x]) => [k, f(v)]));',
    'Object.fromEntries(Object.entries(o).map(([k, { a }]) => [k, a]));',
    'Object.fromEntries(Object.entries(o).map(([k, v = 0]) => [k, v * 2]));',
    'Object.fromEntries(Object.entries(o).map(([k, ...rest]) => [k, rest]));',
    'Object.fromEntries(Object.entries(o).map(({ 0: k, 1: v }) => [k, v * 2]));',
    'Object.fromEntries(Object.entries(o).map(() => [k, 1]));',
    // The returned array is not a two-element `[k, value]`.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v, 1]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, ...v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => ({ k, v })));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => f(k, v)));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => { const r = [k, v * 2]; return r; }));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => { log(v); return [k, v * 2]; }));',
    // Not `Object.entries(o).map(cb)` fed straight into `Object.fromEntries`.
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => v));',
    'Object.fromEntries(Object.keys(o).map(k => [k, o[k]]));',
    'Object.fromEntries(Object.values(o).map(([k, v]) => [k, v * 2]));',
    'Object.entries(o).map(([k, v]) => [k, v * 2]);',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2], thisArg));',
    'Object.fromEntries(Object.entries(o).map(fn));',
    'Object.fromEntries(Object.entries(o).flatMap(([k, v]) => [[k, v * 2]]));',
    'Object.fromEntries(entries.map(([k, v]) => [k, v * 2]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]).filter(Boolean));',
    'Reflect.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]));',
    'Object.fromEntries(Other.entries(o).map(([k, v]) => [k, v * 2]));',
    'new Map(Object.entries(o).map(([k, v]) => [k, v * 2]));',
    // Owned by prefer-key-by.
    'Object.fromEntries(users.map(u => [u.id, u]));',
  ],
  invalid: [
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([key, value]) => [key, fn(value)]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v, k)]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      // A constant value is still a mapValues.
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, 0]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.name]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [v]]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { v }]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(obj.nested).map(([k, v]) => [k, v + 1]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(getObject()).map(([k, v]) => [k, !v]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(function ([k, v]) { return [k, v * 2]; }));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(function double([k, v]) { return [k, v * 2]; }));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => { return [k, v * 2]; }));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'const doubled = Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'function double(o) { return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2])); }',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'use(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2])));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: [
        'const a = Object.fromEntries(Object.entries(x).map(([k, v]) => [k, v * 2]));',
        'const b = Object.fromEntries(Object.entries(y).map(([k, v]) => [k, String(v)]));',
      ].join('\n'),
      errors: [
        { messageId: 'preferMapValues' },
        { messageId: 'preferMapValues' },
      ],
    },
    {
      code: 'Object.fromEntries(Object.entries(prices).map(([k, v]: [string, number]) => [k, v * 2]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v * 2])) as Record<string, number>;',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'const totals: Record<string, number> = Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, Number(v) as number]));',
      errors: [{ messageId: 'preferMapValues' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(prices).map(function ([k, v]: [string, number]): [string, string] { return [k, v.toFixed(2)]; }));',
      errors: [{ messageId: 'preferMapValues' }],
    },
  ],
});
