# prefer-clamp

Prefer [`clamp`](https://es-toolkit.dev/reference/math/clamp.html) from es-toolkit over
nested `Math.min`/`Math.max`.

`clamp(value, minimum, maximum)` is exactly `Math.min(Math.max(value, minimum), maximum)`,
so the nested form is more verbose and harder to read than the named utility.

## Rule details

This rule reports — it does **not** auto-fix — any two-bound clamp idiom where a `Math.min`
call wraps a `Math.max` call (or vice versa) as a direct argument.

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
```

## Limitations

- **Syntactic match.** `Math` is matched by name, so a shadowed local variable named
  `Math` could produce a false positive. This is rare in practice.
- **Two-bound form only.** The single-bound `Math.min(a, b)` / `Math.max(a, b)` form is
  intentionally not reported — it is too common and ambiguous to flag reliably.
- **No auto-fix by design.** The fix requires adding an `import { clamp } from 'es-toolkit'`
  and choosing argument order, so the rule only reports.
