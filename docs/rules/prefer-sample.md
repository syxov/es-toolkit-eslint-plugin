# prefer-sample

Prefer [`sample`](https://es-toolkit.dev/reference/array/sample.html) from es-toolkit over
random-index array access.

`sample(arr)` returns a random element; `arr[Math.floor(Math.random() * arr.length)]` spells
out the same idea by hand and repeats the array.

## Rule details

This rule reports — it does **not** auto-fix — a read of `arr[<index>]` whose index
truncates `Math.random() * arr.length` (either operand order) to an integer, whether by
`Math.floor`/`Math.trunc`, `~~`, or `… | 0`, where `arr` is the same expression on both
sides.

### ❌ Incorrect

```js
arr[Math.floor(Math.random() * arr.length)];
arr[Math.floor(arr.length * Math.random())];
arr[Math.trunc(Math.random() * arr.length)];
arr[~~(Math.random() * arr.length)];
arr[(Math.random() * arr.length) | 0];
items[Math.floor(Math.random() * items.length)];
```

### ✅ Correct

```js
import { sample } from 'es-toolkit';

sample(arr);

// Not a random element pick — left untouched (most are reported by prefer-random-int):
arr[Math.floor(Math.random() * 3)]; // fixed range
a[Math.floor(Math.random() * b.length)]; // the length of a different array
a[Math.floor(Math.random() * (a.length - 1))]; // skips the last element
arr[Math.floor(Math.random() * arr.length)] = x; // a write, not a pick
arr[i];
```

## Limitations

- **Syntactic identity.** The indexed object and the `.length` object must have the same
  source text, so aliases of the same array are not reported, and
  `getArr()[Math.floor(Math.random() * getArr().length)]` is reported although the two
  calls may return different arrays.
- **Truncation only.** The index must truncate toward zero (`Math.floor`, `Math.trunc`, `~~`,
  or `| 0`); `Math.round`/`Math.ceil` indices are not reported.
- **Syntactic match.** A shadowed local `Math` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { sample } from 'es-toolkit'`.
