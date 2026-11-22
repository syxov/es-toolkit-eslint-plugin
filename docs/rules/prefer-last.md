# prefer-last

Prefer [`last`](https://es-toolkit.dev/reference/array/last.html) from es-toolkit over
`arr[arr.length - 1]`.

`last(arr)` reads as "the last element"; `arr[arr.length - 1]` repeats the array and forces
the reader to compute the index.

## Rule details

This rule reports — it does **not** auto-fix — a read of a computed member access whose
index is `<same object>.length - 1`.

### ❌ Incorrect

```js
arr[arr.length - 1];
items[items.length - 1];
this.items[this.items.length - 1];
```

### ✅ Correct

```js
import { last } from 'es-toolkit';

last(arr);

// Not a last-element read — left untouched:
arr[arr.length - 2];
arr[i - 1];
a[b.length - 1]; // the length of a different array
arr[arr.length - 1] = x; // a write (also `++`, `delete`, destructuring targets)
arr.at(-1); // the native equivalent, also fine
```

## Limitations

- **Syntactic identity.** The indexed object and the `.length` object must have the same
  source text, so `a[b.length - 1]` is not reported even when `a` and `b` alias the same
  array, and `getArr()[getArr().length - 1]` is reported although the two calls may return
  different arrays.
- **Native alternative.** `arr.at(-1)` is a concise built-in; this rule suggests es-toolkit's
  `last` to keep call sites consistent with the rest of the toolkit.
- **No auto-fix by design.** The fix requires adding an `import { last } from 'es-toolkit'`.
