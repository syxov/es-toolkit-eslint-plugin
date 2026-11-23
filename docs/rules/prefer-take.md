# prefer-take

Prefer [`take`](https://es-toolkit.dev/reference/array/take.html) over `arr.slice(0, n)`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-take': 'error'`.

It is opt-in because `.slice(0, n)` is idiomatic and is just as common on strings as on
arrays. Without type information the rule cannot recognise every string receiver.

This rule reports — it does **not** auto-fix — a `.slice(0, n)` call whose start is the
number literal `0`, unless the code shows that the receiver is not an array or that the
slice is not a `take` (see below). A negative end drops elements from the end instead;
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
items.slice(0, items.length - 2); // drops from the end: dropRight
points.slice(0, adjacent ? -2 : -1); // a negative end in either branch

// Half of a splice or a rotation — left untouched:
[...items.slice(0, i), item, ...items.slice(i + 1)];
[...items.slice(n), ...items.slice(0, n)];

// String contexts — left untouched:
s.slice(0, 1).toUpperCase();
s.slice(0, 3) + '…';
`${s.slice(0, 3)}…`;
```

### Not reported: the receiver is not an array

es-toolkit's `take` takes an array (`readonly T[]`); a string, a typed array or a `Buffer`
does not type-check. A `.slice(0, n)` is skipped when the syntax or an in-file declaration
shows such a receiver:

```ts
// The receiver is visibly a string.
date.toISOString().slice(0, 10);
hash.digest('hex').slice(0, 8);

// The result is read as a string.
underscore > 0 ? id.slice(0, underscore) : 'Item';
valueStr.slice(0, valueStr.indexOf('(')).trim();

// The in-file declaration shows a string, a typed array or a Buffer.
function parse(value: string) {
  return value.slice(0, end);
}
const succStart = new Int32Array(n + 1);
succStart.slice(0, n);
const [body] = useState<Uint8Array | null>(null);
body.slice(0, 100);
```

## Limitations

- **No type information.** A string that only its type reveals — a callback parameter
  (`(v, ctx) => v.slice(0, 3)`), a property (`node.data.slice(0, offset)`), the return value
  of a call or an imported constant — is still reported. So is a custom class whose
  `.slice` returns something else.
- Only a literal unary minus (also as a branch of `?:`) marks a negative end. An end that
  is negative only at runtime (`arr.slice(0, offset)`) is reported; check the value before
  rewriting.
- **Splice pairs.** A `.slice(0, n)` is skipped when the same receiver is sliced again from
  a non-zero, non-negative start in the same statement. Two independent slices written in
  one statement are therefore skipped too; the two branches of a `?:` and a negative start
  (`takeRight`) are not treated as pairs.
- No auto-fix is provided because adding the import is project-specific.
