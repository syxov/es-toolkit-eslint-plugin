# prefer-round

Prefer [`round`](https://es-toolkit.dev/reference/math/round.html) from es-toolkit over
scaling `Math.round` by a power of ten or converting a `toFixed` string back to a number.

`round(value, precision)` rounds a number to `precision` decimal places. The hand-written
forms either repeat the scale factor (`Math.round(x * 100) / 100`) or take a detour through
a string (`Number(x.toFixed(2))`), and both hide the intent behind arithmetic or type
conversions.

## Rule details

This rule reports — it does **not** auto-fix — two shapes:

- `Math.round(x * F) / F` or `Math.round(F * x) / F`, where `Math.round` has exactly one
  argument and both `F` are number literals with the same value, a power of ten of at least
  `10` (`10`, `100`, `1e2`, …; `100` and `1e2` count as equal). The division is reported.
- A one-argument `x.toFixed(n)` converted back to a number with `Number(…)`,
  `parseFloat(…)`, `Number.parseFloat(…)` (each with exactly one argument) or unary `+`.
  The conversion is reported.

### ❌ Incorrect

```js
Math.round(price * 100) / 100;
Math.round(100 * price) / 100;
Math.round(x * 1e3) / 1000;

Number(x.toFixed(2));
parseFloat(x.toFixed(2));
Number.parseFloat(x.toFixed(digits));
+x.toFixed(2);
```

### ✅ Correct

```js
import { round } from 'es-toolkit';

round(price, 2);
round(x, 3);
round(x, digits);

// Not reported:
Math.round(x * 100) / 10; // the factors differ
Math.round(x * n) / n; // the factor is not a literal
Math.floor(x * 100) / 100; // a different rounding method
x.toFixed(2); // a formatted string is the goal
parseInt(x.toFixed(2)); // a different conversion
```

## Limitations

- **`toFixed` semantics differ.** `round` uses `Math.round` semantics (halves round up,
  toward +∞), while `toFixed` rounds the binary value of the number and returns a string.
  Results can differ in edge cases such as `1.005`, and for negative halves, so check the
  values that matter before rewriting a `toFixed` round-trip.
- **Syntactic match.** `Math` and `Number` are matched by name, so a shadowed local
  variable with either name could produce a false positive. `toFixed` is matched by method
  name on any receiver.
- **Literal factors only.** Only number-literal powers of ten are detected. Computed
  factors such as `10 ** n`, `Math.pow(10, n)` or a named constant are not reported, and
  neither are factors below `10` such as `1` or `0.01`.
- **No auto-fix by design.** The fix requires adding an `import { round } from 'es-toolkit'`
  and turning the factor into a precision, so the rule only reports.
