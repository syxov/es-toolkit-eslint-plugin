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
[...new Set([...a, ...b, ...c])]; // uniq([...a, ...b, ...c])
```

### ✅ Correct

```js
import { uniq } from 'es-toolkit';

uniq(arr);

// Not a dedupe round-trip — left untouched:
new Set(arr);
[...arr];
Array.from(new Set(arr), x => x * 2); // a map, not plain uniq
[...new Set(code.match(re))]; // `match` may return null: `uniq(null)` throws
```

## Limitations

- **Syntactic match.** `Set`/`Array` are matched by name, so shadowed locals could produce
  a false positive. This is rare in practice.
- **Single-argument `Set` only.** `[...new Set()]` (empty) is not reported.
- **Two-array spread-concatenation is a union.** `[...new Set([...a, ...b])]` (exactly two
  spreads) is reported by [`prefer-union`](prefer-union.md), not here. Any other literal,
  such as three spreads or a spread plus a value, is reported here, and so are two spreads
  of a Map/Set iterator or a Set (`[...new Set([...a.keys(), ...b.keys()])]`), which `union`
  cannot take.
- **Nullable arguments.** `new Set(null)` is empty, but `uniq(null)` throws. A `.match(…)`
  argument is skipped; other nullable values are not detected.
- **`Array.from(set, mapFn)`** is intentionally skipped — the second argument transforms
  the result, so it is not a plain `uniq`.
- **No auto-fix by design.** The fix requires adding an `import { uniq } from 'es-toolkit'`.
