# prefer-difference

Prefer [`difference`](https://es-toolkit.dev/reference/array/difference.html) from
es-toolkit over `a.filter(x => !b.includes(x))`.

Filtering out the members of another array is `difference(a, b)` — clearer, and `O(n + m)`
instead of the `O(n * m)` of a `filter` + `includes` scan.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose
body is `!<other>.includes(<param>)`.

### ❌ Incorrect

```js
a.filter(x => !b.includes(x));
items.filter(item => !exclude.includes(item));
```

### ✅ Correct

```js
import { difference } from 'es-toolkit';

difference(a, b);

// Not a difference — left untouched:
a.filter(x => b.includes(x)); // that is `intersection`
a.filter(x => !b.includes(x.id)); // compares a property, not the element
```

## Limitations

- **Predicate is identity-checked.** Only `!b.includes(x)` where `x` is the predicate's
  own parameter is reported, so `!b.includes(x.id)` is left alone.
- **`includes` only.** The `b.indexOf(x) === -1` / `b.indexOf(x) < 0` variants are not
  matched.
- **Syntactic match.** The rule does not verify `b` is an array; a `Set`/`Map` receiver
  named the same way would still report.
- **No auto-fix by design.** The fix requires adding an
  `import { difference } from 'es-toolkit'`.
