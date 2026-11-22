# prefer-in-range

Prefer [`inRange`](https://es-toolkit.dev/reference/math/inRange.html) over a manual lower- and upper-bound check.

## Rule details

This rule reports — it does **not** auto-fix — two adjacent `&&` operands where one is an
inclusive lower bound (`x >= a` or `a <= x`) and the other an exclusive upper bound
(`x < b` or `b > x`) on the same value, in either order. The pair may sit at the end of a
longer `&&` chain (`ok && x >= a && x < b`); each comparison is paired at most once.

### ❌ Incorrect

```js
value >= start && value < end;
start <= value && value < end;
value < end && value >= start;
end > value && start <= value;
isReady && index >= 0 && index < items.length;
```

### ✅ Correct

```js
import { inRange } from 'es-toolkit';

inRange(value, start, end);

// Not an `inRange` check — left untouched:
value >= start && value <= end; // inclusive end: `inRange` excludes `end`
value > start && value < end; // exclusive start
value >= start && other < end; // different values
value >= start && ok && value < end; // bounds not adjacent
```

## Limitations

- **`min >= max` throws.** es-toolkit's `inRange(value, min, max)` throws when `min >= max`,
  whereas the hand-written comparison simply returns `false`. Only rewrite when the bounds
  are known to be ordered.
- **Exclusive upper bound only.** An inclusive `<=` upper bound is not matched because
  `inRange` excludes its end.
- **Adjacent operands only.** The two comparisons must be neighbours in the `&&` chain, and
  the value expressions must be syntactically identical (same source text).
- No auto-fix is provided because adding imports is project-specific.
