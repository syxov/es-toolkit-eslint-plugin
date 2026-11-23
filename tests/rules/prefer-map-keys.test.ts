import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferMapKeys } from '../../src/rules/prefer-map-keys.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-map-keys', preferMapKeys, {
  valid: [
    'mapKeys(o, (v, k) => k.toUpperCase());',
    // A plain copy: neither the key nor the value changes.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v]));',
    // Owned by prefer-map-values: the key is kept, the value changes.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]));',
    // Owned by prefer-invert.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));',
    // Both the key and the value change.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), g(v)]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v.name]));',
    // The new key does not come from the old key.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v.id, v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, v]));',
    "Object.fromEntries(Object.entries(o).map(([k, v]) => ['x', v]));",
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [other, v]));',
    // Callback parameter shapes that are not a single `[k, v]` pattern.
    'Object.fromEntries(Object.entries(o).map(([k, v], i) => [k + i, v]));',
    'Object.fromEntries(Object.entries(o).map((entry) => [f(entry[0]), entry[1]]));',
    'Object.fromEntries(Object.entries(o).map(([, v]) => [f(v), v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v = 0]) => [f(k), v]));',
    'Object.fromEntries(Object.entries(o).map(([k, ...v]) => [f(k), v]));',
    // The returned array is not a two-element entry.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), ...v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [...k, v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v, 1]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => { log(k); return [f(k), v]; }));',
    // Not `Object.entries(o).map(cb)` fed straight into `Object.fromEntries`.
    'Object.fromEntries(Object.keys(o).map(k => [f(k), o[k]]));',
    'Object.fromEntries(entries.map(([k, v]) => [f(k), v]));',
    'Object.entries(o).map(([k, v]) => [f(k), v]);',
    'new Map(Object.entries(o).map(([k, v]) => [f(k), v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v], thisArg));',
    'Object.fromEntries(Object.entries(o).map(toEntry));',
  ],
  invalid: [
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v]));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([key, value]) => [`prefix-${key}`, value]));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      // The new key may read the value too: mapKeys passes `(value, key)`.
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [k + v.id, v]));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [aliases[k], v]));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(function ([k, v]) { return [camelCase(k), v]; }));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => { return [camelCase(k), v]; }));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'const renamed = Object.fromEntries(Object.entries(getObject()).map(([k, v]) => [k.slice(1), v]));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(env).map(([k, v]: [string, string]) => [k.toLowerCase(), v]));',
      errors: [{ messageId: 'preferMapKeys' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(env).map(([k, v]) => [k.toLowerCase() as Key, v])) as Record<Key, string>;',
      errors: [{ messageId: 'preferMapKeys' }],
    },
  ],
});
