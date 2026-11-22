# prefer-mean

Prefer [`mean`](https://es-toolkit.dev/reference/math/mean.html) from es-toolkit over
dividing a `reduce` sum by `.length`.

`arr.reduce((a, b) => a + b, 0) / arr.length` is the long way to write an average;
`mean(arr)` states the intent directly.

## Rule details

This rule reports — it does **not** auto-fix — a division whose numerator is the
[`prefer-sum`](prefer-sum.md) shape (`xs.reduce((a, b) => a + b, 0)`, or with no seed) and
whose denominator is the `.length` of the same receiver, `xs.length`.

### ❌ Incorrect

```js
arr.reduce((a, b) => a + b, 0) / arr.length;
nums.reduce((acc, x) => acc + x, 0) / nums.length;
this.values.reduce((a, b) => a + b) / this.values.length;
```

### ✅ Correct

```js
import { mean } from 'es-toolkit';

mean(arr);

// Not a mean — left untouched:
total / arr.length; // numerator is not a reduce sum
arr.reduce((a, b) => a * b, 0) / arr.length; // not addition
arr.reduce((a, b) => a + b, 0) / count; // denominator is not `.length`
a.reduce((s, x) => s + x, 0) / b.length; // another array's length — see `prefer-sum`
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **The numerator must be the exact sum shape.** Same constraints as
  [`prefer-sum`](prefer-sum.md): an expression-body arrow (not a `function` callback) adding
  its two params, seeded with the number `0` or not seeded. A seedless reduce throws on an
  empty array, while `mean([])` returns `NaN`.
- **The receivers are compared as written.** `xs.reduce(…) / xs.length` and
  `this.items.reduce(…) / this.items.length` are reported; `a.reduce(…) / b.length` is a
  sum divided by something else and is left to `prefer-sum`. The comparison is textual
  apart from type-only wrappers: `(xs as number[]).reduce(…) / xs.length` is a mean, while
  `xs.map(f).reduce(…) / xs.length` is not.
- **No auto-fix by design.** The fix requires adding an `import { mean } from 'es-toolkit'`.
