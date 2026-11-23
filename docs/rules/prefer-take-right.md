# prefer-take-right

Prefer [`takeRight`](https://es-toolkit.dev/reference/array/takeRight.html) over
`arr.slice(-n)`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-take-right': 'error'`.

It is opt-in because `.slice(-n)` is idiomatic and is just as common on strings as on
arrays (a file extension is `name.slice(-4)`). Without type information the rule cannot
recognise every string receiver.

This rule reports — it does **not** auto-fix — a `.slice(-n)` call with exactly one
argument that is a negative (unary minus) expression, unless the code shows that the
receiver is not an array (see below). A second argument makes it a range
(`arr.slice(-n, -1)`), which is left alone.

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
items.slice(-1)[0]; // the last element: see prefer-last

// String contexts — left untouched:
s.slice(-1).toUpperCase();
s.slice(-3) + '…';
`…${s.slice(-3)}`;
```

### Not reported: the receiver is not an array

es-toolkit's `takeRight` takes an array (`readonly T[]`); a string, a typed array or a
`Buffer` does not type-check (and `takeRight('', n)` returns `[]`, not `''`). A
`.slice(-n)` is skipped when the syntax or an in-file declaration shows such a receiver:

```ts
// The receiver is visibly a string: the zero-padding idiom.
`000${date.getFullYear()}`.slice(-4);
('0' + n).slice(-2);
date.getFullYear().toString().slice(-2);

// The result is read as a string.
textarea.value.slice(-1) === '\n';

// The in-file declaration shows a string or a Buffer.
const authTag = Buffer.from(token, 'base64').slice(-16);
```

## Limitations

- **No type information.** A string that only its type reveals — a callback parameter, a
  property (`node.data.slice(-1)`), the return value of a call or an imported constant —
  is still reported.
- Only a literal unary minus marks a negative start. A start that is negative only at
  runtime (`arr.slice(offset)`) is not reported.
- **Zero behaves differently.** `takeRight(arr, 0)` returns `[]`, while `arr.slice(-0)`
  returns the whole array. If `n` can be `0` at runtime, check the callers before
  rewriting `arr.slice(-n)` as `takeRight(arr, n)`.
- No auto-fix is provided because adding the import is project-specific.
