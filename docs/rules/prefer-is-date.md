# prefer-is-date

Prefer [`isDate`](https://es-toolkit.dev/reference/predicate/isDate.html) from es-toolkit over
`value instanceof Date`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Date` identifier. A negated check `!(value instanceof Date)` is replaced by
`!isDate(value)`.

### ❌ Incorrect

```js
value instanceof Date;
!(value instanceof Date);
```

### ✅ Correct

```js
import { isDate } from 'es-toolkit';

isDate(value);
!isDate(value);

// Not a plain `Date` check — left untouched:
value instanceof DateLike;
value instanceof window.Date;
```

## Limitations

- **Syntactic match.** `Date` is matched by name, so a shadowed local `Date` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Date` or `globalThis.Date`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isDate } from 'es-toolkit'`.
