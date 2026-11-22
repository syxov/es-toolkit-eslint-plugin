# prefer-capitalize

Prefer [`capitalize`](https://es-toolkit.dev/reference/string/capitalize.html) from
es-toolkit over `s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()`.

`capitalize(s)` upper-cases the first character and lower-cases the rest — exactly the
hand-written pattern, but named.

## Rule details

This rule reports — it does **not** auto-fix — a string built from two halves, joined
either with `+` or as a template literal holding nothing but the two expressions
(`` `${first}${rest}` ``):

- the first half upper-cases the first character: `s.charAt(0).toUpperCase()` or
  `s[0].toUpperCase()`;
- the second half lower-cases the rest: `s.slice(1).toLowerCase()` or
  `s.substring(1).toLowerCase()`;
- both halves use the **same** receiver.

### ❌ Incorrect

```js
s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
s[0].toUpperCase() + s.substring(1).toLowerCase();
`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`;
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
- **`slice(1)` / `substring(1)` only.** `substr(1)` and lower-casing before slicing
  (`s.toLowerCase().slice(1)`) are not matched.
- **The pair must stand alone.** In a longer concatenation such as
  `'Hi ' + s[0].toUpperCase() + s.slice(1).toLowerCase()`, `+` groups from the left, so the
  two halves are not siblings and the pattern is not reported. The same holds for a
  template literal with any text around the two expressions.
- **`upperFirst` is separate.** Without `.toLowerCase()` on the rest, the pattern is
  reported by [`prefer-upper-first`](prefer-upper-first.md).
- **No auto-fix by design.** The fix requires adding an
  `import { capitalize } from 'es-toolkit'`.
