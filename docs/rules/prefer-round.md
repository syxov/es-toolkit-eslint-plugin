# prefer-round

Prefer [`round`](https://es-toolkit.dev/reference/math/round.html) from es-toolkit over
scaling `Math.round` by a power of ten.

`round(value, precision)` rounds a number to `precision` decimal places. es-toolkit computes
exactly `Math.round(value * 10 ** precision) / 10 ** precision`, so the hand-written form only
repeats the scale factor and hides the intent behind arithmetic.

## Rule details

This rule reports — it does **not** auto-fix — `Math.round(x * F) / F` or
`Math.round(F * x) / F`, where `Math.round` has exactly one argument and both `F` are number
literals with the same value, a power of ten of at least `10` (`10`, `100`, `1e2`, …; `100`
and `1e2` count as equal). The division is reported.

### ❌ Incorrect

```js
Math.round(price * 100) / 100;
Math.round(100 * price) / 100;
Math.round(x * 1e3) / 1000;
```

### ✅ Correct

```js
import { round } from 'es-toolkit';

round(price, 2);
round(x, 3);

// Not reported:
Math.round(x * 100) / 10; // the factors differ
Math.round(x * n) / n; // the factor is not a literal
Math.floor(x * 100) / 100; // a different rounding method
x.toFixed(2); // a formatted string is the goal
Number(x.toFixed(2)); // rounds decimal ties differently, see below
parseFloat(x.toFixed(2));
+x.toFixed(2);
```

## Limitations

- **`toFixed` round-trips are not reported.** `Number(x.toFixed(n))`, `parseFloat(…)` and
  `+x.toFixed(n)` round the binary value of the number, and negative halves away from zero,
  while `round` uses `Math.round` on the scaled value (halves toward +∞). They disagree on
  many decimal ties: `Number((0.15).toFixed(1))` is `0.1`, `round(0.15, 1)` is `0.2`;
  `Number((-0.25).toFixed(1))` is `-0.3`, `round(-0.25, 1)` is `-0.2`. `toFixed` also
  truncates a fractional digit count, where `round` throws. Rewrite such code by hand only
  when those inputs cannot occur.
- **Syntactic match.** `Math` is matched by name, so a shadowed local variable named
  `Math` could produce a false positive.
- **Literal factors only.** Only number-literal powers of ten are detected. Computed
  factors such as `10 ** n`, `Math.pow(10, n)` or a named constant are not reported, and
  neither are factors below `10` such as `1` or `0.01`.
- **No auto-fix by design.** The fix requires adding an `import { round } from 'es-toolkit'`
  and turning the factor into a precision, so the rule only reports.
