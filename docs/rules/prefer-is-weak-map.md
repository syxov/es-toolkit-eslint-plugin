# prefer-is-weak-map

Prefer [`isWeakMap`](https://es-toolkit.dev/reference/predicate/isWeakMap.html) from es-toolkit over
`value instanceof WeakMap`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `WeakMap` identifier. A negated check `!(value instanceof WeakMap)` is replaced by
`!isWeakMap(value)`.

### ❌ Incorrect

```js
value instanceof WeakMap;
!(value instanceof WeakMap);
```

### ✅ Correct

```js
import { isWeakMap } from 'es-toolkit';

isWeakMap(value);
!isWeakMap(value);

// Not a plain `WeakMap` check — left untouched:
value instanceof WeakMapLike;
value instanceof window.WeakMap;
```

### Not reported

```ts
// One value tested against several types.
value instanceof WeakSet || value instanceof WeakMap;
typeof value === 'string' || value instanceof WeakMap;
// A test assertion.
expect(value instanceof WeakMap).toBe(true);
// The code already has its own `isWeakMap`.
const isWeakMap = (value: unknown) => value instanceof WeakMap;
```

## Limitations

- **Syntactic match.** `WeakMap` is matched by name, so a shadowed local `WeakMap` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.WeakMap` or `globalThis.WeakMap`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isWeakMap` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isWeakMap` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isWeakMap } from 'es-toolkit'`.
