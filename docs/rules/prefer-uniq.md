# prefer-uniq

Prefer [`uniq`](https://es-toolkit.dev/reference/array/uniq.html) from es-toolkit over
round-tripping an array through `new Set`.

`[...new Set(arr)]` and `Array.from(new Set(arr))` exist only to deduplicate; `uniq(arr)`
states that intent directly.

## Rule details

This rule reports — it does **not** auto-fix — an array literal spreading a single
`new Set(x)`, or `Array.from(new Set(x))` with no mapper.

### ❌ Incorrect

```js
[...new Set(arr)];
Array.from(new Set(arr));
```

### ✅ Correct

```js
import { uniq } from 'es-toolkit';

uniq(arr);

// Not a dedupe round-trip — left untouched:
new Set(arr);
[...arr];
Array.from(new Set(arr), x => x * 2); // a map, not plain uniq
```

## Limitations

- **Syntactic match.** `Set`/`Array` are matched by name, so shadowed locals could produce
  a false positive. This is rare in practice.
- **Single-argument `Set` only.** `[...new Set()]` (empty) is not reported.
- **`Array.from(set, mapFn)`** is intentionally skipped — the second argument transforms
  the result, so it is not a plain `uniq`.
- **No auto-fix by design.** The fix requires adding an `import { uniq } from 'es-toolkit'`.
