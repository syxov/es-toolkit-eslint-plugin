# prefer-mean

Prefer [`mean`](https://es-toolkit.dev/reference/math/mean.html) from es-toolkit over
dividing a `reduce` sum by `.length`.

`arr.reduce((a, b) => a + b, 0) / arr.length` is the long way to write an average;
`mean(arr)` states the intent directly.

## Rule details

This rule reports — it does **not** auto-fix — a division whose numerator is the
`reduce((a, b) => a + b, 0)` sum shape and whose denominator is a `.length` access.

### ❌ Incorrect

```js
arr.reduce((a, b) => a + b, 0) / arr.length;
nums.reduce((acc, x) => acc + x, 0) / nums.length;
```

### ✅ Correct

```js
import { mean } from 'es-toolkit';

mean(arr);

// Not a mean — left untouched:
total / arr.length; // numerator is not a reduce sum
arr.reduce((a, b) => a * b, 0) / arr.length; // not addition
arr.reduce((a, b) => a + b, 0) / count; // denominator is not `.length`
```

## Limitations

- **The numerator must be the exact sum shape.** Same constraints as
  [`prefer-sum`](prefer-sum.md): a two-param arrow adding its params, seeded with `0`.
- **The numerator and denominator arrays are not cross-checked.** `a.reduce(…) / b.length`
  is still reported; the rule is syntactic and does not verify they are the same array.
- **No auto-fix by design.** The fix requires adding an `import { mean } from 'es-toolkit'`.
