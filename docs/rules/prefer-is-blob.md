# prefer-is-blob

Prefer [`isBlob`](https://es-toolkit.dev/reference/predicate/isBlob.html) from es-toolkit over
`value instanceof Blob`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Blob` identifier. A negated check `!(value instanceof Blob)` is replaced by
`!isBlob(value)`.

### ❌ Incorrect

```js
value instanceof Blob;
!(value instanceof Blob);
```

### ✅ Correct

```js
import { isBlob } from 'es-toolkit';

isBlob(value);
!isBlob(value);

// Not a plain `Blob` check — left untouched:
value instanceof BlobLike;
value instanceof window.Blob;
```

### Not reported

```ts
// One value tested against several types.
value instanceof File || value instanceof Blob;
typeof value === 'string' || value instanceof Blob;
// A test assertion.
expect(value instanceof Blob).toBe(true);
// The code already has its own `isBlob`.
const isBlob = (value: unknown) => value instanceof Blob;
```

## Limitations

- **Syntactic match.** `Blob` is matched by name, so a shadowed local `Blob` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Blob` or `globalThis.Blob`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isBlob` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isBlob` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isBlob } from 'es-toolkit'`.
