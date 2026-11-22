# prefer-union

Prefer [`union`](https://es-toolkit.dev/reference/array/union.html) from es-toolkit over
deduplicating a spread-concatenation of two arrays through `new Set`.

`[...new Set([...a, ...b])]` concatenates then deduplicates — that is exactly `union(a, b)`.

## Rule details

This rule reports — it does **not** auto-fix — `[...new Set([...a, ...b])]` or
`Array.from(new Set([...a, ...b]))` where the `Set` is built from an array literal of exactly
two spreads, matching `union(arr1, arr2)`, which takes exactly two arrays.

### ❌ Incorrect

```js
[...new Set([...a, ...b])];
Array.from(new Set([...a, ...b]));
```

### ✅ Correct

```js
import { union } from 'es-toolkit';

union(a, b);

// Not a union — left to `prefer-uniq` or untouched:
[...new Set(arr)]; // plain dedupe — see `prefer-uniq`
new Set([...a, ...b]); // no spread/`Array.from` wrapper, so not collected back to an array
[...new Set([...a, ...b, ...c])]; // three arrays — see `prefer-uniq`
[...new Set([...a, ...b, x])]; // not only spreads — see `prefer-uniq`
```

## Limitations

- **Exactly two spreads.** `union` takes exactly two arrays, so any other array literal
  (`[...a]`, `[...a, ...b, ...c]`, `[...a, ...b, x]`) is treated as a plain dedupe and
  reported by [`prefer-uniq`](prefer-uniq.md) instead.
- **Spread-concatenation only.** `union` of named arrays written as `a.concat(b)` inside a
  `Set` is not matched.
- **Syntactic match.** `Set`/`Array` are matched by name, so a shadowed local could
  produce a false positive. This is rare in practice.
- **No auto-fix by design.** The fix requires adding an
  `import { union } from 'es-toolkit'`.
