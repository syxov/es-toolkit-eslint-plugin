# prefer-initial

Prefer [`initial`](https://es-toolkit.dev/reference/array/initial.html) over `arr.slice(0, -1)`.

## Rule details

This rule reports — it does **not** auto-fix — a `.slice(0, -1)` call, unless its context
shows the receiver is a string.

### ❌ Incorrect

```js
items.slice(0, -1);
parts.slice(0, -1).join('/');
```

### ✅ Correct

```js
import { initial } from 'es-toolkit';

initial(items);

// String contexts — left untouched:
s.slice(0, -1).toLowerCase();
s.slice(0, -1) + '…';
`${path.slice(0, -1)}/`;
```

## Limitations

- The rule matches the syntax only and does not prove that the receiver is an array.
- **String heuristic.** Arrays are not case-converted, concatenated with `+` or
  interpolated, so a `.slice(0, -1)` that is directly the receiver of
  `toUpperCase`/`toLowerCase`/`toLocaleUpperCase`/`toLocaleLowerCase`, an operand of binary
  `+`, or an expression of a template literal is skipped. Any other string
  `.slice(0, -1)` (`const head = s.slice(0, -1)`) is still reported.
- No auto-fix is provided because adding the import is project-specific.
