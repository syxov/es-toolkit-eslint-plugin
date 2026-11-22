# prefer-take

Prefer [`take`](https://es-toolkit.dev/reference/array/take.html) over `arr.slice(0, n)`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-take': 'error'`.

It is opt-in because `.slice(0, n)` is idiomatic and is just as common on strings as on
arrays. The rule is syntactic, so outside the recognised string contexts below it cannot
tell a string receiver from an array.

This rule reports — it does **not** auto-fix — a `.slice(0, n)` call whose start is the
number literal `0` and whose end is not a negative (unary minus) expression, unless its
context shows the receiver is a string. A negative end drops elements from the end instead;
`arr.slice(0, -1)` is covered by [`prefer-initial`](prefer-initial.md).

### ❌ Incorrect

```js
items.slice(0, 3);
results.slice(0, limit).map(render);
```

### ✅ Correct

```js
import { take } from 'es-toolkit';

take(items, 3);
take(results, limit).map(render);

// Not a take — left untouched:
items.slice(0, -2);
items.slice(1, 3);

// String contexts — left untouched:
s.slice(0, 1).toUpperCase();
s.slice(0, 3) + '…';
`${s.slice(0, 3)}…`;
```

## Limitations

- The rule matches the syntax only and does not check the receiver type, so it does not
  prove that the receiver is an array.
- **String heuristic.** Arrays are not case-converted, concatenated with `+` or
  interpolated, so a `.slice(0, n)` that is directly the receiver of
  `toUpperCase`/`toLowerCase`/`toLocaleUpperCase`/`toLocaleLowerCase`, an operand of binary
  `+`, or an expression of a template literal is skipped. Any other string `.slice(0, n)`
  (`const prefix = s.slice(0, 3)`, `s.slice(0, 3).trim() + suffix`) is still reported.
- Only a literal unary minus marks a negative end. An end that is negative only at runtime
  (`arr.slice(0, offset)`) is reported; check the value before rewriting.
- No auto-fix is provided because adding the import is project-specific.
