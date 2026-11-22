# prefer-take-right

Prefer [`takeRight`](https://es-toolkit.dev/reference/array/takeRight.html) over
`arr.slice(-n)`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-take-right': 'error'`.

It is opt-in because `.slice(-n)` is idiomatic and is just as common on strings as on
arrays (a file extension is `name.slice(-4)`). The rule is syntactic, so outside the
recognised string contexts below it cannot tell a string receiver from an array.

This rule reports — it does **not** auto-fix — a `.slice(-n)` call with exactly one
argument that is a negative (unary minus) expression, unless its context shows the receiver
is a string. A second argument makes it a range (`arr.slice(-n, -1)`), which is left alone.

### ❌ Incorrect

```js
items.slice(-3);
history.slice(-count).map(render);
```

### ✅ Correct

```js
import { takeRight } from 'es-toolkit';

takeRight(items, 3);
takeRight(history, count).map(render);

// Not a takeRight — left untouched:
items.slice(-3, -1);
items.slice(n);

// String contexts — left untouched:
s.slice(-1).toUpperCase();
s.slice(-3) + '…';
`…${s.slice(-3)}`;
```

## Limitations

- The rule matches the syntax only and does not check the receiver type, so it does not
  prove that the receiver is an array.
- **String heuristic.** Arrays are not case-converted, concatenated with `+` or
  interpolated, so a `.slice(-n)` that is directly the receiver of
  `toUpperCase`/`toLowerCase`/`toLocaleUpperCase`/`toLocaleLowerCase`, an operand of binary
  `+`, or an expression of a template literal is skipped. Any other string `.slice(-n)`
  (`const ext = name.slice(-4)`, `s.slice(-3).trim() + suffix`) is still reported.
- Only a literal unary minus marks a negative start. A start that is negative only at
  runtime (`arr.slice(offset)`) is not reported.
- **Zero behaves differently.** `takeRight(arr, 0)` returns `[]`, while `arr.slice(-0)`
  returns the whole array. If `n` can be `0` at runtime, check the callers before
  rewriting `arr.slice(-n)` as `takeRight(arr, n)`.
- No auto-fix is provided because adding the import is project-specific.
