# prefer-clamp

Prefer [`clamp`](https://es-toolkit.dev/reference/math/clamp.html) from es-toolkit over
nested `Math.min`/`Math.max`.

`clamp(value, minimum, maximum)` is exactly `Math.min(Math.max(value, minimum), maximum)`,
so the nested form is more verbose and harder to read than the named utility.

## Rule details

This rule reports — it does **not** auto-fix — any two-bound clamp idiom where a `Math.min`
call wraps a `Math.max` call (or vice versa) as a direct argument. A clamp nested in another
clamp is reported once, at the outer call.

### ❌ Incorrect

```js
Math.min(Math.max(value, lower), upper);
Math.max(Math.min(value, upper), lower);
Math.min(upper, Math.max(value, lower)); // argument order does not matter
```

### ✅ Correct

```js
import { clamp } from 'es-toolkit';

clamp(value, lower, upper);

// Not a clamp — left untouched:
Math.min(a, b);
Math.min(Math.min(a, b), c);
// Both arguments are wrapped: a symmetric min/max, e.g. an interval-overlap test.
Math.max(Math.min(aStart, aEnd), Math.min(bStart, bEnd));
// Interval normalisation: the same function also computes the mirrored `Math.max(from, to)`
// (or `Math.min(from, to)` for the other half), so the pair is ordered before it is bounded.
const fromColumn = Math.max(Math.min(from, to), 1);
const toColumn = Math.min(Math.max(from, to), columnCount);
const overlap =
  Math.min(Math.max(a.x, b.x), rect.right)
  - Math.max(Math.min(a.x, b.x), rect.left);
// An index bounded by the last index of a possibly empty list: `clamp(i, 0, xs.length - 1)`
// would return -1 for an empty list.
Math.min(i, Math.max(0, xs.length - 1));
```

## Limitations

- **Syntactic match.** `Math` is matched by name, so a shadowed local variable named
  `Math` could produce a false positive. This is rare in practice.
- **Two-bound form only.** The single-bound `Math.min(a, b)` / `Math.max(a, b)` form is
  intentionally not reported — it is too common and ambiguous to flag reliably.
- **`Math.max` outside differs when the bounds cross.** es-toolkit's `clamp(v, lower, upper)`
  is exactly `Math.min(Math.max(v, lower), upper)`, so the `Math.min`-outside form is always
  equivalent, whatever the bounds. The `Math.max`-outside form `Math.max(Math.min(v, upper),
lower)` (or `Math.max(lower, Math.min(v, upper))`) is reported too, but it equals
  `clamp(v, lower, upper)` only while `lower <= upper`: when `lower > upper` it returns
  `lower`, while `clamp` returns `upper`. With computed bounds (`Math.max(Math.min(page,
count - 3), 2)`, a balloon wider than the viewport) that case can be reachable; make sure
  the bounds are ordered, or keep the original, before rewriting.
- **Exactly one wrapped argument.** When both arguments of the outer call are the opposite
  call, the expression is not reported: symmetric forms such as interval overlap rely on the
  case where the bounds cross.
- **Interval normalisation is recognised by its mirror.** A bounded `Math.min(a, b)` /
  `Math.max(a, b)` is skipped only when the same function also calls the opposite method on
  the same two operands (either order). A normalisation whose other half lives in another
  function, or is written differently (`a < b ? b : a`), is still reported.
- **No auto-fix by design.** The fix requires adding an `import { clamp } from 'es-toolkit'`
  and choosing argument order, so the rule only reports.
