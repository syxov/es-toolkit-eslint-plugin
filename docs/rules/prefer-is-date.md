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

### Not reported

```ts
// One value tested against several types.
value instanceof Number || value instanceof Date;
typeof value === 'string' || value instanceof Date;
// A test assertion.
expect(value instanceof Date).toBe(true);
// The code already has its own `isDate`.
const isDate = (value: unknown) => value instanceof Date;
```

## Limitations

- **Syntactic match.** `Date` is matched by name, so a shadowed local `Date` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Date` or `globalThis.Date`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isDate` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isDate` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isDate } from 'es-toolkit'`.
