# prefer-capitalize

Prefer [`capitalize`](https://es-toolkit.dev/reference/string/capitalize.html) from
es-toolkit over `s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()`.

`capitalize(s)` upper-cases the first character and lower-cases the rest — exactly the
hand-written pattern, but named.

## Rule details

This rule reports — it does **not** auto-fix — a `+` expression whose left side
upper-cases the first character (`s.charAt(0).toUpperCase()` or `s[0].toUpperCase()`) and
whose right side is `s.slice(1).toLowerCase()`, with the **same** receiver on both sides.

### ❌ Incorrect

```js
s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
s[0].toUpperCase() + s.slice(1).toLowerCase();
```

### ✅ Correct

```js
import { capitalize } from 'es-toolkit';

capitalize(s);

// Not a `capitalize` — left untouched:
s.charAt(0).toUpperCase() + s.slice(1); // no lower-casing — that is `upperFirst`
a.charAt(0).toUpperCase() + b.slice(1).toLowerCase(); // different receivers
```

## Limitations

- **Same-receiver match is textual.** The two halves must read identically; a receiver
  with side effects on each call is not detected.
- **`slice(1)` only.** `substring(1)` / `substr(1)` variants are not matched.
- **`upperFirst` is separate.** Without `.toLowerCase()` on the rest, the pattern is
  reported by [`prefer-upper-first`](prefer-upper-first.md).
- **No auto-fix by design.** The fix requires adding an
  `import { capitalize } from 'es-toolkit'`.
