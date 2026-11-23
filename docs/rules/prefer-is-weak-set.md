# prefer-is-weak-set

Prefer [`isWeakSet`](https://es-toolkit.dev/reference/predicate/isWeakSet.html) from es-toolkit over
`value instanceof WeakSet`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `WeakSet` identifier. A negated check `!(value instanceof WeakSet)` is replaced by
`!isWeakSet(value)`.

### ❌ Incorrect

```js
value instanceof WeakSet;
!(value instanceof WeakSet);
```

### ✅ Correct

```js
import { isWeakSet } from 'es-toolkit';

isWeakSet(value);
!isWeakSet(value);

// Not a plain `WeakSet` check — left untouched:
value instanceof WeakSetLike;
value instanceof window.WeakSet;
```

### Not reported

```ts
// One value tested against several types.
value instanceof WeakMap || value instanceof WeakSet;
typeof value === 'string' || value instanceof WeakSet;
// A test assertion.
expect(value instanceof WeakSet).toBe(true);
// The code already has its own `isWeakSet`.
const isWeakSet = (value: unknown) => value instanceof WeakSet;
```

## Limitations

- **Syntactic match.** `WeakSet` is matched by name, so a shadowed local `WeakSet` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.WeakSet` or `globalThis.WeakSet`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isWeakSet` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isWeakSet` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isWeakSet } from 'es-toolkit'`.
