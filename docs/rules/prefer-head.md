# prefer-head

Prefer [`head`](https://es-toolkit.dev/reference/array/head.html) over `arr[0]`.

## Rule details

This rule reports — it does **not** auto-fix — a read of a computed `[0]` access.

### ❌ Incorrect

```js
items[0];
const first = rows[0];
```

### ✅ Correct

```js
import { head } from 'es-toolkit';

head(items);

// Not a first-element read — left untouched:
obj['0']; // a string key
items[0] = value; // a write (also `items[0]++`, `delete items[0]`, `[items[0]] = xs`)
s[0].toUpperCase(); // first-character string idiom, see prefer-upper-first / prefer-capitalize
```

## Limitations

- The rule syntactically matches any computed `[0]` read; it does not prove that the
  receiver is an array.
- `s[0]` is skipped only when it is directly case-converted (`toUpperCase`, `toLowerCase`,
  `toLocaleUpperCase`, `toLocaleLowerCase`); other string reads such as `s[0] === '#'` are
  still reported because detection is syntactic.
- No auto-fix is provided because adding the import is project-specific.
