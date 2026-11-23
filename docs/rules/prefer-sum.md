# prefer-sum

Prefer [`sum`](https://es-toolkit.dev/reference/math/sum.html) from es-toolkit over
`reduce((a, b) => a + b, 0)`.

Summing with `reduce` is a well-worn idiom, but `sum(arr)` says exactly what it does in
one word and avoids the off-by-seed bugs of the `reduce` form.

## Rule details

This rule reports — it does **not** auto-fix — a `.reduce` whose reducer is a
two-parameter arrow that adds its own parameters, either seeded with the number `0` or with
no seed.

### ❌ Incorrect

```js
arr.reduce((a, b) => a + b, 0);
arr.reduce((acc, x) => x + acc, 0);
arr.reduce((a, b) => a + b); // throws on an empty array; `sum([])` returns 0
a.reduce((s, x) => s + x, 0) / b.length; // divided by another array's length: not a mean
```

### ✅ Correct

```js
import { sum } from 'es-toolkit';

sum(arr);

// Not a plain sum — left untouched:
arr.reduce((a, b) => a * b, 0); // not addition
arr.reduce((a, b) => a + b, '0'); // a string seed concatenates
arr.reduce((a, b) => a.x + b, 0); // adds a property, not the element
arr.reduce((a, b) => a + b, 0) / arr.length; // a mean — see `prefer-mean`
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.
See [Method-call chains](../method-call-chains.md).

## Limitations

- **Arrow, expression body only.** A block-body reducer (`(a, b) => { return a + b; }`) or
  a `function` expression is not matched.
- **Numeric `0` seed or none.** Any other seed (`1`, `'0'`) is left alone. The seedless form
  is reported although it behaves differently on an empty array: `reduce((a, b) => a + b)`
  throws, while `sum([])` returns `0`.
- **The mean form is excluded.** `xs.reduce(…) / xs.length` is reported by
  [`prefer-mean`](prefer-mean.md), not here, to avoid a double report. The receiver and the
  `.length` object are compared as written, so `a.reduce(…) / b.length` or
  `(xs as number[]).reduce(…) / xs.length` stays a sum and is reported here.
- **No auto-fix by design.** The fix requires adding an `import { sum } from 'es-toolkit'`.
