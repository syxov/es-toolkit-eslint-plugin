# prefer-uniq-by

Prefer [`uniqBy`](https://es-toolkit.dev/reference/array/uniqBy.html) from es-toolkit over
reading the values of `new Map(xs.map(x => [key, x]))`.

`[...new Map(xs.map(x => [x.id, x])).values()]` deduplicates an array by a key through an
intermediate array of entries, a Map and an iterator. `uniqBy(xs, x => x.id)` names the
intent directly.

## Rule details

This rule reports — it does **not** auto-fix — an array literal whose only element spreads
`new Map(…).values()`, or `Array.from(new Map(…).values())` with no mapper, where the Map
is built from a single argument that is directly a one-argument `.map(callback)` call, and
the callback:

- has exactly one parameter, a plain identifier `x` (a type annotation is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns a two-element array literal `[key, x]` with no spread, whose second element is
  the bare parameter and whose key reads the parameter without being the parameter itself.

TypeScript type arguments on the Map (`new Map<string, User>(…)`) are allowed.

**Duplicates resolve differently.** For a duplicate key, the Map keeps the **last**
element (at the position where the key first appeared), while `uniqBy` keeps the **first**
element. Switching changes which duplicate survives. When the last one matters, reverse the
array before calling `uniqBy`, or keep the Map. Reversing changes the result order too, so
keep the Map when you need both the last element and the first key's position.

### ❌ Incorrect

```ts
const unique = [...new Map(users.map(u => [u.id, u])).values()];
Array.from(new Map(users.map(u => [u.email.toLowerCase(), u])).values());
[
  ...new Map<string, User>(
    users.map((u: User) => [`${u.first}-${u.last}`, u]),
  ).values(),
];
Array.from(
  new Map(
    users.map(function (u) {
      return [u.id, u];
    }),
  ).values(),
);
```

### ✅ Correct

```ts
import { uniqBy } from 'es-toolkit';

const unique = uniqBy(users, u => u.id);

// Not a uniqBy — left untouched:
new Map(users.map(u => [u.id, u])); // the Map itself is kept
[...new Map(users.map(u => [u.id, u])).keys()]; // the keys, not the elements
[...new Map(users.map(u => [u.id, u.name])).values()]; // the value is not the element
[...new Map(users.map((u, i) => [i, u])).values()]; // the index is used
Array.from(new Map(users.map(u => [u.id, u])).values(), f); // a map, not plain uniqBy
[...new Map(users.map(toEntry)).values()]; // the callback is not inline
```

## Limitations

- **Last versus first duplicate.** The Map form keeps the last element for each key and
  `uniqBy` keeps the first, so the suggested rewrite is only equivalent when duplicates are
  interchangeable or the first one is wanted. Reverse first, or keep the Map, when the last
  one matters.
- **Syntactic match.** `Map` and `Array` are matched by name, so shadowed local variables
  with those names could produce a false positive. Computed access such as `Array['from']`
  is not reported.
- **Direct nesting only.** The `.map` call must be the direct argument of `new Map`, and
  `.values()` must be called directly on the `new Map(…)` expression; a Map or entries held
  in a variable are not reported.
- **`map` form only.** Other dedupe-by-key idioms, such as
  `xs.filter((x, i) => xs.findIndex(y => y.id === x.id) === i)` or a `reduce` into a Map,
  are not detected.
- **No auto-fix by design.** The fix requires adding an `import { uniqBy } from 'es-toolkit'`,
  turning the entry into a key callback and choosing which duplicate to keep, so the rule
  only reports.
