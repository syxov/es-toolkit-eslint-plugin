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

## Limitations

- **Syntactic match.** `Error` is matched by name, so a shadowed local `Error` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Error` or `globalThis.Error`
  are not reported.
- **`Error` only.** `value instanceof TypeError` (or any other subclass) is not reported:
  `isError` accepts every `Error`, so it is not a replacement for a subclass check.
- **No auto-fix by design.** The fix requires adding an `import { isError } from 'es-toolkit'`.
