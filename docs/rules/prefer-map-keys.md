# prefer-map-keys

Prefer [`mapKeys`](https://es-toolkit.dev/reference/object/mapKeys.html) from es-toolkit
over `Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v]))`.

Turning an object into entries, renaming each key and rebuilding the object states the intent
indirectly and allocates an intermediate array of entries. `mapKeys(o, (v, k) => f(k))` names
the intent and keeps the values untouched by construction.

## Rule details

This rule reports — it does **not** auto-fix — an `Object.fromEntries` call whose only
argument is directly a one-argument `.map(callback)` call on `Object.entries(o)` (with
exactly one argument), where the callback:

- has exactly one parameter, an array pattern `[k, v]` of two plain identifiers (a type
  annotation on the pattern is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns a two-element array literal `[key, v]` with no spread, whose second element is the
  bare value parameter and whose first element is a new key computed from the old key `k`
  (it may read `v` too: `mapKeys` passes `(value, key, object)`).

Sibling shapes go elsewhere: `[k, f(v)]` is `prefer-map-values`, `[v, k]` is
`prefer-invert`. A plain copy (`[k, v]`) and a callback that changes both the key and the
value are reported by none of them.

### ❌ Incorrect

```ts
const lower = Object.fromEntries(
  Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
);
const prefixed = Object.fromEntries(
  Object.entries(files).map(([path, file]) => [`src/${path}`, file]),
);
Object.fromEntries(
  Object.entries(o).map(function ([k, v]: [string, number]) {
    return [aliases[k], v];
  }),
);
```

### ✅ Correct

```ts
import { mapKeys } from 'es-toolkit';

const lower = mapKeys(headers, (v, k) => k.toLowerCase());
const prefixed = mapKeys(files, (file, path) => `src/${path}`);
mapKeys(o, (v, k) => aliases[k]);

// Not a mapKeys — left untouched:
Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v])); // a plain copy
Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), g(v)])); // both change
Object.fromEntries(Object.entries(o).map(([k, v]) => [v.id, v])); // the key ignores k
Object.fromEntries(Object.entries(o).map(([k, v], i) => [k + i, v])); // the index is used
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. Computed access such as `Object['fromEntries']`
  is not reported.
- **Destructured callback only.** A callback that indexes the entry instead of destructuring
  it, such as `entry => [f(entry[0]), entry[1]]`, is not detected.
- **Key from the key.** A new key computed from the value alone (`[v.id, v]`) is not
  reported; `keyBy(Object.values(o), v => v.id)` may express it better.
- **Direct nesting only.** `Object.entries(o).map(…)` must be the direct argument of
  `Object.fromEntries`; entries built through a variable or another call are not reported.
- **No auto-fix by design.** The fix requires adding an `import { mapKeys } from 'es-toolkit'`
  and turning the entry into a key callback, so the rule only reports.
