# prefer-is-error

Prefer [`isError`](https://es-toolkit.dev/reference/predicate/isError.html) from es-toolkit over
`value instanceof Error`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Error` identifier. A negated check `!(value instanceof Error)` is replaced by
`!isError(value)`.

### ❌ Incorrect

```js
value instanceof Error;
!(value instanceof Error);
```

### ✅ Correct

```js
import { isError } from 'es-toolkit';

isError(value);
!isError(value);

// Not a plain `Error` check — left untouched:
value instanceof ErrorLike;
value instanceof window.Error;
value instanceof TypeError;
```

### Not reported

```ts
// One value tested against several types.
value instanceof String || value instanceof Error;
typeof value === 'string' || value instanceof Error;
// A test assertion.
expect(value instanceof Error).toBe(true);
// The code already has its own `isError`.
const isError = (value: unknown) => value instanceof Error;
```

## Limitations

- **Syntactic match.** `Error` is matched by name, so a shadowed local `Error` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Error` or `globalThis.Error`
  are not reported.
- **`Error` only.** `value instanceof TypeError` (or any other subclass) is not reported:
  `isError` accepts every `Error`, so it is not a replacement for a subclass check.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isError` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isError` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isError } from 'es-toolkit'`.
