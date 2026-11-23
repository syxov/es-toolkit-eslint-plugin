# prefer-in-range

Prefer [`inRange`](https://es-toolkit.dev/reference/math/inRange.html) over a manual lower- and upper-bound check.

## Rule details

This rule reports — it does **not** auto-fix — two adjacent `&&` operands where one is an
inclusive lower bound and the other an exclusive upper bound on the same value, when both
bounds are number literals (a leading minus is allowed) and the lower one is smaller.

The value must read as the subject of both comparisons: on the left of both
(`x >= a && x < b`, in either order), or in the middle (`a <= x && x < b`). The pair may sit
at the end of a longer `&&` chain (`ok && x >= 0 && x < 10`); each comparison is paired at
most once.

### ❌ Incorrect

```js
status >= 200 && status < 300;
200 <= status && status < 300;
offset < 1 && offset >= -1;
isReady && ratio >= 0.25 && ratio < 0.75;
```

### ✅ Correct

```js
import { inRange } from 'es-toolkit';

inRange(status, 200, 300);

// Not reported:
index >= 0 && index < items.length; // variable bound: `inRange` throws on an empty list
value >= start && value < end; // variable bounds: `inRange` throws when `start >= end`
value >= 10 && value < 0; // `inRange` throws: the bounds are not ordered
value >= 0 && value <= 10; // inclusive end: `inRange` excludes `end`
value > 0 && value < 10; // exclusive start
0 <= value && 10 > value; // the value is not read as the subject
dx > 0.5 && dy <= 0.5; // a shared threshold, two different values
value >= 0 && ok && value < 10; // bounds not adjacent
```

## Why variable bounds are not reported

es-toolkit's `inRange(value, min, max)` **throws** when `min >= max`, whereas the
hand-written comparison simply returns `false`. Bounds that are variables can coincide at
runtime: `i >= 0 && i < xs.length` is exactly the guard that has to survive an empty `xs`,
and ranges such as `i >= startLine && i < endLine` are empty for a one-line selection.
Without type and flow information the rule cannot prove that variable bounds are ordered,
so it only reports literal bounds, where the order is visible. String comparisons
(`key >= 'a' && key < 'n'`) and bigint bounds are not reported either: `inRange` takes
numbers.

## Limitations

- **Literal bounds only.** Ranges with ordered variable bounds (`x >= box.left && x < box.right`
  on a non-empty box) are valid `inRange` candidates but are not reported; rewrite them by
  hand when the bounds can never coincide.
- **Exclusive upper bound only.** An inclusive `<=` upper bound is not matched because
  `inRange` excludes its end.
- **Subject shapes only.** `a <= x && b > x` and `b > x && a <= x` put the value on the right
  of the upper bound, which reads as a threshold test, so they are left alone.
- **Adjacent operands only.** The two comparisons must be neighbours in the `&&` chain, and
  the value expressions must be syntactically identical (same source text).
- **Not type-aware.** A value that is not a number (`dateKey >= 0 && dateKey < 10` on a
  string) is still reported.
- No auto-fix is provided because adding imports is project-specific.
