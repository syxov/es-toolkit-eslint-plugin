# prefer-lower-first

Prefer [`lowerFirst`](https://es-toolkit.dev/reference/string/lowerFirst.html) from
es-toolkit over lower-casing the first character by hand.

`lowerFirst(s)` lower-cases the first character and leaves the rest untouched — exactly
the hand-written pattern, but named.

## Rule details

This rule reports — it does **not** auto-fix — a string built from two halves, joined
either with `+` or as a template literal holding nothing but the two expressions
(`` `${first}${rest}` ``):

- the first half lower-cases the first character: `s.charAt(0).toLowerCase()` or
  `s[0].toLowerCase()`;
- the second half is the rest: `s.slice(1)` or `s.substring(1)`;
- both halves use the **same** receiver.

### ❌ Incorrect

```js
name.charAt(0).toLowerCase() + name.slice(1);
name[0].toLowerCase() + name.substring(1);
`${name[0].toLowerCase()}${name.slice(1)}`;
```

### ✅ Correct

```js
import { lowerFirst } from 'es-toolkit';

lowerFirst(name);

// Not a `lowerFirst` — left untouched:
name[0].toUpperCase() + name.slice(1); // that is `upperFirst`
a.charAt(0).toLowerCase() + b.slice(1); // different receivers
```

## Limitations

- **Same-receiver match is textual.** The two halves must read identically; a receiver
  with side effects on each call is not detected.
- **`slice(1)` / `substring(1)` only.** `substr(1)` and `slice(1, s.length)` are not
  matched.
- **The pair must stand alone.** In a longer concatenation such as
  `'_' + s[0].toLowerCase() + s.slice(1)`, `+` groups from the left, so the two halves are
  not siblings and the pattern is not reported. The same holds for a template literal with
  any text around the two expressions.
- **No auto-fix by design.** The fix requires adding an
  `import { lowerFirst } from 'es-toolkit'`.
