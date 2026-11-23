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

### Not reported

```ts
// One value tested against several types.
value instanceof SharedArrayBuffer || value instanceof ArrayBuffer;
typeof value === 'string' || value instanceof ArrayBuffer;
// A test assertion.
expect(value instanceof ArrayBuffer).toBe(true);
// The code already has its own `isArrayBuffer`.
const isArrayBuffer = (value: unknown) => value instanceof ArrayBuffer;
```

## Limitations

- **Syntactic match.** `ArrayBuffer` is matched by name, so a shadowed local `ArrayBuffer` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.ArrayBuffer` or `globalThis.ArrayBuffer`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isArrayBuffer` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isArrayBuffer` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isArrayBuffer } from 'es-toolkit'`.
