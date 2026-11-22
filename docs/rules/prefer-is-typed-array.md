# prefer-is-typed-array

Prefer [`isTypedArray`](https://es-toolkit.dev/reference/predicate/isTypedArray.html) from
es-toolkit over a manual ArrayBuffer view check.

## Rule details

This rule reports — it does **not** auto-fix — `ArrayBuffer.isView(value) && !(value instanceof DataView)`
in either operand order, when both operands check the same expression.

### ❌ Incorrect

```js
ArrayBuffer.isView(value) && !(value instanceof DataView);
!(value instanceof DataView) && ArrayBuffer.isView(value);
```

### ✅ Correct

```js
import { isTypedArray } from 'es-toolkit';

isTypedArray(value);

// Left untouched:
ArrayBuffer.isView(a) && !(b instanceof DataView); // different expressions
ArrayBuffer.isView(value) && !(value instanceof Uint8Array);
```

## Limitations

- **Leading operands only.** The check is reported when it opens an `&&` chain
  (`ArrayBuffer.isView(value) && !(value instanceof DataView) && ready`), but not when other
  operands precede it (`ready && ArrayBuffer.isView(value) && …`).
- **Syntactic identity.** Both operands must check the same source text.
- **Syntactic match.** Shadowed `ArrayBuffer` or `DataView` bindings are not detected, and
  `window.DataView` is not recognized.
- **No auto-fix by design.** The fix requires adding an
  `import { isTypedArray } from 'es-toolkit'`.
