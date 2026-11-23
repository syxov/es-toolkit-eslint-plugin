# prefer-is-map

Prefer [`isMap`](https://es-toolkit.dev/reference/predicate/isMap.html) from es-toolkit over
`value instanceof Map`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Map` identifier. A negated check `!(value instanceof Map)` is replaced by
`!isMap(value)`.

### ❌ Incorrect

```js
value instanceof Map;
!(value instanceof Map);
```

### ✅ Correct

```js
import { isMap } from 'es-toolkit';

isMap(value);
!isMap(value);

// Not a plain `Map` check — left untouched:
value instanceof MapLike;
value instanceof window.Map;
```

### Not reported

```ts
// One value tested against several types.
value instanceof Set || value instanceof Map;
typeof value === 'string' || value instanceof Map;
// A test assertion.
expect(value instanceof Map).toBe(true);
// The code already has its own `isMap`.
const isMap = (value: unknown) => value instanceof Map;
```

## Limitations

- **Syntactic match.** `Map` is matched by name, so a shadowed local `Map` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Map` or `globalThis.Map`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isMap` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isMap` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isMap } from 'es-toolkit'`.
