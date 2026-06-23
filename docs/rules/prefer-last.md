# prefer-last

Prefer [`last`](https://es-toolkit.dev/reference/array/last.html) from es-toolkit over
`arr[arr.length - 1]`.

`last(arr)` reads as "the last element"; `arr[arr.length - 1]` repeats the array and forces
the reader to compute the index.

## Rule details

This rule reports — it does **not** auto-fix — a computed member access whose index is
`<something>.length - 1`.

### ❌ Incorrect

```js
arr[arr.length - 1];
items[items.length - 1];
```

### ✅ Correct

```js
import { last } from 'es-toolkit';

last(arr);

// Not a last-element access — left untouched:
arr[arr.length - 2];
arr[i - 1];
arr.at(-1); // the native equivalent, also fine
```

## Limitations

- **Object identity is not checked.** The selector matches the shape `a[b.length - 1]`, so
  the rare case where the indexed array and the `.length` array differ would also be
  reported.
- **Native alternative.** `arr.at(-1)` is a concise built-in; this rule suggests es-toolkit's
  `last` to keep call sites consistent with the rest of the toolkit.
- **No auto-fix by design.** The fix requires adding an `import { last } from 'es-toolkit'`.
