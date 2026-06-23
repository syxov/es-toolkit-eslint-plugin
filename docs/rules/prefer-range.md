# prefer-range

Prefer [`range`](https://es-toolkit.dev/reference/math/range.html) from es-toolkit over
hand-built index arrays.

`range(n)` produces `[0, 1, …, n - 1]`. The manual equivalents — `[...Array(n).keys()]` and
`Array.from({ length: n }, (_, i) => i)` — are noisier ways to say the same thing.

## Rule details

This rule reports — it does **not** auto-fix — two index-array idioms:

- `[...Array(n).keys()]`
- `Array.from({ length: n }, (_, i) => i)` (a mapper that returns its own index)

### ❌ Incorrect

```js
[...Array(n).keys()];
Array.from({ length: n }, (_, i) => i);
```

### ✅ Correct

```js
import { range } from 'es-toolkit';

range(n);

// Not a plain index range — left untouched:
Array.from({ length: n }); // array of holes, not 0…n-1
Array.from({ length: n }, (_, i) => i * 2); // transformed → range(n).map(...)
[...arr.keys()]; // keys of an existing array
```

## Limitations

- **Identity-mapper only.** Only the mapper that returns its index parameter (→ `range(n)`)
  is reported; transformed mappers and `range`'s `start`/`step` variants are not.
- **Syntactic match.** A shadowed local `Array` could produce a false positive. This is
  rare in practice.
- **No auto-fix by design.** The fix requires adding an `import { range } from 'es-toolkit'`.
