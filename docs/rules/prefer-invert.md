# prefer-invert

Prefer [`invert`](https://es-toolkit.dev/reference/object/invert.html) from es-toolkit over
`Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]))`.

Swapping every key with its value through an intermediate array of entries spells out the
mechanics of the operation. `invert(o)` names it.

## Rule details

This rule reports — it does **not** auto-fix — an `Object.fromEntries` call whose only
argument is directly a one-argument `.map(callback)` call on `Object.entries(o)` (with
exactly one argument), where the callback:

- has exactly one parameter, an array pattern `[k, v]` of two plain identifiers (a type
  annotation on the pattern is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns exactly `[v, k]`: the bare value parameter, then the bare key parameter.

A swap that also transforms one side (`[v.id, k]`, `[v, f(k)]`) is not an `invert`, and is
reported by no other rule either.

### ❌ Incorrect

```ts
const byCode = Object.fromEntries(
  Object.entries(codes).map(([name, code]) => [code, name]),
);
Object.fromEntries(
  Object.entries(Colors).map(function ([k, v]: [string, string]) {
    return [v, k];
  }),
);
```

### ✅ Correct

```ts
import { invert } from 'es-toolkit';

const byCode = invert(codes);
invert(Colors);

// Not an invert — left untouched:
Object.fromEntries(Object.entries(o).map(([k, v]) => [v.id, k])); // the new key is transformed
Object.fromEntries(Object.entries(o).map(([k, v]) => [v, f(k)])); // the new value is transformed
new Map(Object.entries(o).map(([k, v]) => [v, k])); // a Map, not an object
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. Computed access such as `Object['fromEntries']`
  is not reported.
- **Destructured callback only.** `e => [e[1], e[0]]` is not detected.
- **Direct nesting only.** `Object.entries(o).map(…)` must be the direct argument of
  `Object.fromEntries`.
- **Types.** `invert` is typed `Record<V, K>`, while the hand-written version is usually cast
  (`as Record<string, string>`); the cast may become unnecessary or need adjusting.
- **No auto-fix by design.** The fix requires adding an `import { invert } from 'es-toolkit'`,
  so the rule only reports.
