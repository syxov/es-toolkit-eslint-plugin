# prefer-upper-first

Prefer [`upperFirst`](https://es-toolkit.dev/reference/string/upperFirst.html) from
es-toolkit over `s.charAt(0).toUpperCase() + s.slice(1)`.

Upper-casing just the first character by hand is easy to get subtly wrong;
`upperFirst(s)` does exactly that, and only that.

## Rule details

This rule reports — it does **not** auto-fix — a string built from two halves, joined
either with `+` or as a template literal holding nothing but the two expressions
(`` `${first}${rest}` ``):

- the first half upper-cases the first character: `s.charAt(0).toUpperCase()` or
  `s[0].toUpperCase()`;
- the second half is the rest: `s.slice(1)` or `s.substring(1)`;
- both halves use the **same** receiver.

### ❌ Incorrect

```js
s.charAt(0).toUpperCase() + s.slice(1);
s[0].toUpperCase() + s.substring(1);
`${s[0].toUpperCase()}${s.slice(1)}`;
```

### ✅ Correct

```js
import { upperFirst } from 'es-toolkit';

upperFirst(s);

// Not an `upperFirst` — left untouched:
s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); // that is `capitalize`
a.charAt(0).toUpperCase() + b.slice(1); // different receivers
`Hi ${s[0].toUpperCase()}${s.slice(1)}`; // extra text around the halves
```

## Limitations

- **Same-receiver match is textual.** The two halves must read identically
  (`s.…() + s.slice(1)`); a receiver with side effects on each call is not detected.
- **`slice(1)` / `substring(1)` only.** `substr(1)` and `slice(1, s.length)` are not
  matched.
- **The pair must stand alone.** In a longer concatenation such as
  `'Hi ' + s[0].toUpperCase() + s.slice(1)`, `+` groups from the left, so the two halves
  are not siblings and the pattern is not reported. The same holds for a template literal
  with any text around the two expressions.
- **`capitalize` is separate.** Adding `.toLowerCase()` to the rest is reported by
  [`prefer-capitalize`](prefer-capitalize.md).
- **No auto-fix by design.** The fix requires adding an
  `import { upperFirst } from 'es-toolkit'`.
