# prefer-chunk

Prefer [`chunk`](https://es-toolkit.dev/reference/array/chunk.html) from es-toolkit over
slicing an array into fixed-size pieces by hand.

A loop that pushes `xs.slice(i, i + size)` while stepping `i` by `size`, or an
`Array.from({ length: Math.ceil(xs.length / size) }, …)` of slices, is `chunk(xs, size)`.

## Rule details

This rule reports — it does **not** auto-fix — two shapes:

- a `for (let i = 0; i < xs.length; i += size)` loop (also `i = i + size`, or
  `let i = 0, n = xs.length; i < n`) whose body only pushes `xs.slice(i, i + size)` into
  another array. The end may also be `size + i`, `Math.min(i + size, xs.length)`, or a
  `const end = i + size` declared just before the push;
- `Array.from({ length: Math.ceil(xs.length / size) }, (_, i) => xs.slice(i * size, …))`
  where the end is `i * size + size` or `(i + 1) * size`.

`size` is an identifier or a positive number literal.

### ❌ Incorrect

```js
const chunks = [];
for (let i = 0; i < items.length; i += size) {
  chunks.push(items.slice(i, i + size));
}

const rows = Array.from({ length: Math.ceil(cells.length / 3) }, (_, i) =>
  cells.slice(i * 3, (i + 1) * 3),
);
```

### ✅ Correct

```js
import { chunk } from 'es-toolkit';

const chunks = chunk(items, size);
const rows = chunk(cells, 3);

// Not a `chunk` — left untouched:
const wrap = (text: string) => {
  for (let i = 0; i < text.length; i += 80) lines.push(text.slice(i, i + 80)); // a string
};
for (let i = 0; i < xs.length; i += size) {
  const batch = xs.slice(i, i + size);
  await send(batch); // the body does more than collect the slices
}
```

## Limitations

- **Strings and other non-arrays.** `chunk` takes an array; slicing a string, a typed array
  or a `Buffer` into pieces is not `chunk`. The receiver is skipped when the file shows it is
  one (a string annotation or initial value, a string default, a typed-array constructor),
  when it is read as a string nearby, or when it is named like a single string (`text`,
  `message`, `this.content`, `fileName`). Any other string from elsewhere is still reported.
- **The loop body must only push the slice.** A loop that processes each batch
  (`await send(xs.slice(i, i + size))`) could iterate `chunk(xs, size)`, but is not reported.
- **Pushing into an existing array.** `out.push(…)` is reported whether `out` starts empty or
  not; for a non-empty `out` the rewrite is `out.push(...chunk(xs, size))`.
- **The step is not checked to be positive.** An identifier step is assumed to be a positive
  integer, as `chunk` requires.
- **No auto-fix by design.** The fix requires adding an `import { chunk } from 'es-toolkit'`.
