# prefer-is-equal

Prefer [`isEqual`](https://es-toolkit.dev/reference/predicate/isEqual.html) from es-toolkit
over comparing `JSON.stringify` output.

Comparing `JSON.stringify(a) === JSON.stringify(b)` is a common but fragile deep-equality
check: it depends on key order, silently drops `undefined`/functions, and throws on circular
references. `isEqual(a, b)` performs a real structural comparison.

## Rule details

This rule reports — it does **not** auto-fix — an equality/inequality comparison whose both
operands are `JSON.stringify(...)` calls.

### ❌ Incorrect

```js
JSON.stringify(a) === JSON.stringify(b);
JSON.stringify(x) !== JSON.stringify(y);
```

### ✅ Correct

```js
import { isEqual } from 'es-toolkit';

isEqual(a, b);

// Not a stringify-based comparison — left untouched:
JSON.stringify(a) === b;
JSON.parse(a) === JSON.parse(b);
```

## Limitations

- **Both operands must be `JSON.stringify`.** Comparing one stringified value against
  something else is not reported.
- **Key-order caveat is the point.** `JSON.stringify` equality is order-sensitive and
  lossy — that fragility is exactly why this rule flags it in favor of `isEqual`.
- **No auto-fix by design.** The fix requires adding an `import { isEqual } from 'es-toolkit'`
  (and inverting with `!` for the `!==` case).
