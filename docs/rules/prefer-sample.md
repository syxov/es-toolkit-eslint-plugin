# prefer-sample

Prefer [`sample`](https://es-toolkit.dev/reference/array/sample.html) from es-toolkit over
random-index array access.

`sample(arr)` returns a random element; `arr[Math.floor(Math.random() * arr.length)]` spells
out the same idea by hand and repeats the array.

## Rule details

This rule reports — it does **not** auto-fix — a computed access whose index truncates
`Math.random() * …length` to an integer, whether by `Math.floor`/`Math.trunc`, `~~`, or
`… | 0`.

### ❌ Incorrect

```js
arr[Math.floor(Math.random() * arr.length)];
arr[Math.trunc(Math.random() * arr.length)];
arr[~~(Math.random() * arr.length)];
arr[(Math.random() * arr.length) | 0];
items[Math.floor(Math.random() * items.length)];
```

### ✅ Correct

```js
import { sample } from 'es-toolkit';

sample(arr);

// Not a random element pick — left untouched:
arr[Math.floor(Math.random() * 3)]; // fixed range, see prefer-random-int
arr[i];
```

## Limitations

- **Object identity is not checked.** The selector matches `a[Math.floor(Math.random() *
b.length)]`, so the rare case where the indexed array and the `.length` array differ would
  also be reported.
- **Truncation only.** The index must truncate toward zero (`Math.floor`, `Math.trunc`, `~~`,
  or `| 0`); `Math.round`/`Math.ceil` indices are not reported.
- **Syntactic match.** A shadowed local `Math` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { sample } from 'es-toolkit'`.
