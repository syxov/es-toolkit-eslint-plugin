# prefer-is-array-buffer

Prefer [`isArrayBuffer`](https://es-toolkit.dev/reference/predicate/isArrayBuffer.html) from es-toolkit over
`value instanceof ArrayBuffer`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `ArrayBuffer` identifier. A negated check `!(value instanceof ArrayBuffer)` is replaced by
`!isArrayBuffer(value)`.

### ❌ Incorrect

```js
value instanceof ArrayBuffer;
!(value instanceof ArrayBuffer);
```

### ✅ Correct

```js
import { isArrayBuffer } from 'es-toolkit';

isArrayBuffer(value);
!isArrayBuffer(value);

// Not a plain `ArrayBuffer` check — left untouched:
value instanceof ArrayBufferLike;
value instanceof window.ArrayBuffer;
```

## Limitations

- **Syntactic match.** `ArrayBuffer` is matched by name, so a shadowed local `ArrayBuffer` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.ArrayBuffer` or `globalThis.ArrayBuffer`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isArrayBuffer } from 'es-toolkit'`.
