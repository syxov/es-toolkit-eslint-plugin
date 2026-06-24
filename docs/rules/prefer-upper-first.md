# prefer-upper-first

Prefer [`upperFirst`](https://es-toolkit.dev/reference/string/upperFirst.html) from
es-toolkit over `s.charAt(0).toUpperCase() + s.slice(1)`.

Upper-casing just the first character by hand is easy to get subtly wrong;
`upperFirst(s)` does exactly that, and only that.

## Rule details

This rule reports — it does **not** auto-fix — a `+` expression whose left side
upper-cases the first character (`s.charAt(0).toUpperCase()` or `s[0].toUpperCase()`) and
whose right side is `s.slice(1)`, with the **same** receiver on both sides.

### ❌ Incorrect

```js
s.charAt(0).toUpperCase() + s.slice(1);
s[0].toUpperCase() + s.slice(1);
```

### ✅ Correct

```js
import { upperFirst } from 'es-toolkit';

upperFirst(s);

// Not an `upperFirst` — left untouched:
s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); // that is `capitalize`
a.charAt(0).toUpperCase() + b.slice(1); // different receivers
```

## Limitations

- **Same-receiver match is textual.** The two halves must read identically
  (`s.…() + s.slice(1)`); a receiver with side effects on each call is not detected.
- **`slice(1)` only.** `substring(1)` / `substr(1)` variants are not matched.
- **`capitalize` is separate.** Adding `.toLowerCase()` to the rest is reported by
  [`prefer-capitalize`](prefer-capitalize.md).
- **No auto-fix by design.** The fix requires adding an
  `import { upperFirst } from 'es-toolkit'`.
