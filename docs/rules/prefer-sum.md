# prefer-sum

Prefer [`sum`](https://es-toolkit.dev/reference/math/sum.html) from es-toolkit over
`reduce((a, b) => a + b, 0)`.

Summing with `reduce` is a well-worn idiom, but `sum(arr)` says exactly what it does in
one word and avoids the off-by-seed bugs of the `reduce` form.

## Rule details

This rule reports — it does **not** auto-fix — a two-argument `.reduce` whose reducer is a
two-parameter arrow that adds its own parameters, seeded with `0`.

### ❌ Incorrect

```js
arr.reduce((a, b) => a + b, 0);
arr.reduce((acc, x) => x + acc, 0);
```

### ✅ Correct

```js
import { sum } from 'es-toolkit';

sum(arr);

// Not a plain sum — left untouched:
arr.reduce((a, b) => a * b, 0); // not addition
arr.reduce((a, b) => a + b); // no `0` seed
arr.reduce((a, b) => a.x + b, 0); // adds a property, not the element
arr.reduce((a, b) => a + b, 0) / arr.length; // a mean — see `prefer-mean`
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **Arrow, expression body only.** A block-body reducer (`(a, b) => { return a + b; }`) or
  a `function` expression is not matched.
- **`0` seed required.** The no-initializer form (`reduce((a, b) => a + b)`) throws on an
  empty array, so it is intentionally left alone.
- **The mean form is excluded.** `reduce(…, 0) / arr.length` is reported by `prefer-mean`,
  not here, to avoid a double report.
- **No auto-fix by design.** The fix requires adding an `import { sum } from 'es-toolkit'`.
