# prefer-key-by

Prefer [`keyBy`](https://es-toolkit.dev/reference/array/keyBy.html) from es-toolkit over
`Object.fromEntries(xs.map(x => [key, x]))`.

Building an object of elements indexed by a key through an intermediate array of entries
states the intent indirectly. `keyBy(xs, x => key)` names it and skips the entry array.

## Rule details

This rule reports — it does **not** auto-fix — an `Object.fromEntries` call whose only
argument is directly a one-argument `.map(callback)` call, where the callback:

- has exactly one parameter, a plain identifier `x` (a type annotation is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns a two-element array literal `[key, x]` with no spread, whose second element is
  the bare parameter and whose key reads the parameter without being the parameter itself.

With duplicate keys both forms keep the last element, so the replacement is equivalent.

### ❌ Incorrect

```ts
const usersById = Object.fromEntries(users.map(u => [u.id, u]));
const bySlug = Object.fromEntries(posts.map(p => [p.slug.toLowerCase(), p]));
Object.fromEntries(users.map(u => [`${u.type}:${u.id}`, u]));
Object.fromEntries(
  users.map(function (u: User) {
    return [u.id, u];
  }),
);
```

### ✅ Correct

```ts
import { keyBy } from 'es-toolkit';

const usersById = keyBy(users, u => u.id);

// Not a keyBy — left untouched:
Object.fromEntries(users.map(u => [u.id, u.name])); // the value is not the element
Object.fromEntries(users.map(u => ['id', u])); // the key does not depend on the element
Object.fromEntries(users.map((u, i) => [i, u])); // the index is used
Object.fromEntries(users.map(u => [u.id, u], thisArg)); // `thisArg` has no keyBy equivalent
Object.fromEntries(users.map(toEntry)); // the callback is not inline
new Map(users.map(u => [u.id, u])); // a Map, not an object
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. Computed access such as `Object['fromEntries']`
  is not reported.
- **`map` form only.** The `reduce` forms that build the same object, such as
  `xs.reduce((acc, x) => { acc[x.id] = x; return acc; }, {})` or
  `xs.reduce((acc, x) => ({ ...acc, [x.id]: x }), {})`, are not detected.
- **Direct nesting only.** The `.map` call must be the direct argument of
  `Object.fromEntries`; entries built through a variable or another call are not reported.
- **No auto-fix by design.** The fix requires adding an `import { keyBy } from 'es-toolkit'`
  and turning the entry into a key callback, so the rule only reports.
