# prefer-is-empty

Prefer [`isEmpty`](https://es-toolkit.dev/reference/predicate/isEmpty.html) from es-toolkit
over `Object.keys(obj).length === 0`.

`isEmpty(obj)` answers "does this object have no own enumerable keys?" directly, without
allocating an intermediate keys array.

## Rule details

This rule reports — it does **not** auto-fix — an equality comparison of
`Object.keys(...).length` against `0`, in either operand order.

### ❌ Incorrect

```js
Object.keys(obj).length === 0;
0 === Object.keys(obj).length;
```

### ✅ Correct

```js
import { isEmpty } from 'es-toolkit';

isEmpty(obj);

// Not in scope — left untouched:
Object.keys(obj).length === 1;
Object.values(obj).length === 0;
arr.length === 0;
```

## Limitations

- **`Object.keys` only.** `Object.values(...)`/`Object.entries(...)` length checks and bare
  `arr.length === 0` / `str.length === 0` are intentionally **not** flagged — they are too
  common and clear to rewrite reliably.
- **Syntactic match.** A shadowed local `Object` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { isEmpty } from 'es-toolkit'`.
