# prefer-is-set

Prefer [`isSet`](https://es-toolkit.dev/reference/predicate/isSet.html) from es-toolkit over
`value instanceof Set`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Set` identifier. A negated check `!(value instanceof Set)` is replaced by
`!isSet(value)`.

### ❌ Incorrect

```js
value instanceof Set;
!(value instanceof Set);
```

### ✅ Correct

```js
import { isSet } from 'es-toolkit';

isSet(value);
!isSet(value);

// Not a plain `Set` check — left untouched:
value instanceof SetLike;
value instanceof window.Set;
```

### Not reported

```ts
// One value tested against several types.
value instanceof Map || value instanceof Set;
typeof value === 'string' || value instanceof Set;
// A test assertion.
expect(value instanceof Set).toBe(true);
// The code already has its own `isSet`.
const isSet = (value: unknown) => value instanceof Set;
```

## Limitations

- **Syntactic match.** `Set` is matched by name, so a shadowed local `Set` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Set` or `globalThis.Set`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isSet` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isSet` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isSet } from 'es-toolkit'`.
