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

## Limitations

- **Syntactic match.** `Blob` is matched by name, so a shadowed local `Blob` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Blob` or `globalThis.Blob`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isBlob } from 'es-toolkit'`.
