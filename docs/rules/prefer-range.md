# prefer-range

Prefer [`range`](https://es-toolkit.dev/reference/math/range.html) from es-toolkit over
hand-built index arrays.

`range(n)` produces `[0, 1, …, n - 1]`. The manual equivalents — `[...Array(n).keys()]`,
`Array.from({ length: n }, (_, i) => i)` and friends — are noisier ways to say the same thing.

## Rule details

This rule reports — it does **not** auto-fix — these index-array idioms:

- `[...Array(n).keys()]`
- `Array.from({ length: n }, mapper)`
- `Array.from({ length: n }).map(mapper)`
- `[...Array(n)].map(mapper)` and `[...new Array(n)].map(mapper)`
- `Array(n).fill(v).map(mapper)` and `new Array(n).fill(v).map(mapper)` (also `fill()`)

where `mapper` returns its own second (index) parameter: `(_, i) => i`,
`(_, i) => { return i; }` or `function (_, i) { return i; }`.

### ❌ Incorrect

```js
[...Array(n).keys()];
Array.from({ length: n }, (_, i) => i);
Array.from({ length: n }, function (_, i) {
  return i;
});
Array.from({ length: n }).map((_, i) => i);
[...Array(n)].map((_, i) => i);
Array(n)
  .fill(0)
  .map((_, i) => i);
```

### ✅ Correct

```js
import { range } from 'es-toolkit';

range(n);

// Not a plain index range — left untouched:
Array.from({ length: n }); // array of holes, not 0…n-1
Array.from({ length: n }, (_, i) => i * 2); // transformed → range(n).map(...)
Array(n).map((_, i) => i); // `map` skips holes: still n holes
Array(n)
  .fill(0, 2)
  .map((_, i) => i); // a partial fill leaves holes
[...arr.keys()]; // keys of an existing array
```

## Limitations

- **Identity-mapper only.** Only a mapper whose body is (or whose single statement returns)
  its index parameter is reported; transformed mappers and `range`'s `start`/`step` variants
  are not.
- **Length semantics.** `range(n)` rounds a fractional `n` up and throws a `RangeError` for
  `NaN`, while `Array.from({ length: n })` truncates it and returns `[]` for `NaN`. When the
  length is computed (`Math.max(...values) + 1`), check it is an integer before rewriting.
- **Syntactic match.** A shadowed local `Array` could produce a false positive. This is
  rare in practice.
- **No auto-fix by design.** The fix requires adding an `import { range } from 'es-toolkit'`.
