# prefer-map-values

Prefer [`mapValues`](https://es-toolkit.dev/reference/object/mapValues.html) from es-toolkit
over `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))`.

Turning an object into entries, mapping each value and rebuilding the object states the
intent indirectly and allocates an intermediate array of entries. `mapValues(o, v => f(v))`
names the intent and keeps the keys untouched by construction.

## Rule details

This rule reports — it does **not** auto-fix — an `Object.fromEntries` call whose only
argument is directly a one-argument `.map(callback)` call on `Object.entries(o)` (with
exactly one argument), where the callback:

- has exactly one parameter, an array pattern `[k, v]` of two plain identifiers (a type
  annotation on the pattern is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns a two-element array literal `[k, value]` with no spread, whose first element is
  the bare key parameter and whose second element is anything except the bare value
  parameter.

`mapValues` calls its iteratee with `(value, key, object)`, so a new value computed from
the key as well as the value (`[k, f(v, k)]`) is covered too.

### ❌ Incorrect

```ts
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2]),
);
const labels = Object.fromEntries(
  Object.entries(users).map(([id, user]) => [id, user.name]),
);
Object.fromEntries(Object.entries(o).map(([k, v]) => [k, format(v, k)]));
Object.fromEntries(
  Object.entries(prices).map(function ([k, v]: [string, number]) {
    return [k, v.toFixed(2)];
  }),
);
```

### ✅ Correct

```ts
import { mapValues } from 'es-toolkit';

const doubled = mapValues(prices, v => v * 2);
const labels = mapValues(users, user => user.name);
mapValues(o, (v, k) => format(v, k));

// Not a mapValues — left untouched:
Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v])); // a plain copy
Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k])); // the key changes
Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toUpperCase(), v])); // mapKeys
Object.fromEntries(Object.entries(o).filter(([k, v]) => v)); // pickBy
Object.fromEntries(Object.entries(o).map(([k, v], i) => [k, v + i])); // the index is used
Object.fromEntries(Object.entries(o).map(toEntry)); // the callback is not inline
new Map(Object.entries(o).map(([k, v]) => [k, v * 2])); // a Map, not an object
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. Computed access such as `Object['fromEntries']`
  is not reported.
- **Destructured callback only.** A callback that indexes the entry instead of
  destructuring it, such as `entry => [entry[0], f(entry[1])]`, is not detected.
- **Values only.** Callbacks that change the key (`mapKeys`) or entry filters such as
  `Object.fromEntries(Object.entries(o).filter(…))` (`pickBy` / `omitBy`) are out of scope
  for this rule.
- **Direct nesting only.** `Object.entries(o).map(…)` must be the direct argument of
  `Object.fromEntries`; entries built through a variable or another call are not reported.
- **No auto-fix by design.** The fix requires adding an
  `import { mapValues } from 'es-toolkit'` and turning the entry into a value callback, so
  the rule only reports.
