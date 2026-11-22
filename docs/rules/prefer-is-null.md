# prefer-is-null

Prefer [`isNull`](https://es-toolkit.dev/reference/predicate/isNull.html) from es-toolkit over
`value === null`.

## Rule details

This rule reports — it does **not** auto-fix — a strict comparison with the `null` literal,
`===` or `!==`, in either operand order. A negated check is replaced by `!isNull(value)`.

Loose `value == null` also matches `undefined`, so it is left to
[`prefer-is-nil`](./prefer-is-nil.md). A strict comparison that is one half of a combined
`null`/`undefined` check (`value === null || value === undefined`) is left to
[`prefer-is-nil`](./prefer-is-nil.md) / [`prefer-is-not-nil`](./prefer-is-not-nil.md), so the
pair is reported once. A `.filter(x => x !== null)` predicate is left to
[`prefer-without`](./prefer-without.md) (`without(arr, null)`).

### ❌ Incorrect

```js
value === null;
null === value;
value !== null;
```

### ✅ Correct

```js
import { isNull } from 'es-toolkit';

isNull(value);
!isNull(value);

// Left untouched:
value == null; // prefer-is-nil
value === null || value === undefined; // prefer-is-nil
arr.filter(x => x !== null); // prefer-without
value === 'null'; // a string, not the null literal
```

## Limitations

- **Adjacent pairs only.** A pair is recognized when its halves sit next to each other in a
  `||` / `&&` chain; `value === null || ready || value === undefined` still reports the
  `null` half here.
- **Hand-off to prefer-without.** The `.filter(x => x !== null)` predicate is skipped even
  when prefer-without does not report it (disabled, or excluded by its `chainPosition` or
  `skipTypePredicate` options).
- **No auto-fix by design.** The fix requires adding an `import { isNull } from 'es-toolkit'`.
