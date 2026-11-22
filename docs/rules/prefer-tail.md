# prefer-tail

Prefer [`tail`](https://es-toolkit.dev/reference/array/tail.html) over `arr.slice(1)`.

## Rule details

This rule reports — it does **not** auto-fix — a `.slice(1)` call, unless its context shows
the receiver is a string.

### ❌ Incorrect

```js
items.slice(1);
fn(args.slice(1));
```

### ✅ Correct

```js
import { tail } from 'es-toolkit';

tail(items);

// String contexts — left untouched:
s.slice(1).toLowerCase();
s[0].toUpperCase() + s.slice(1); // see prefer-upper-first / prefer-capitalize
`#${id.slice(1)}`;
```

## Limitations

- The rule matches the syntax only and does not prove that the receiver is an array.
- **String heuristic.** Arrays are not case-converted, concatenated with `+` or
  interpolated, so a `.slice(1)` that is directly the receiver of
  `toUpperCase`/`toLowerCase`/`toLocaleUpperCase`/`toLocaleLowerCase`, an operand of binary
  `+`, or an expression of a template literal is skipped. Any other string `.slice(1)`
  (`const rest = s.slice(1)`, `s.slice(1).trim() + x`) is still reported.
- No auto-fix is provided because adding the import is project-specific.
