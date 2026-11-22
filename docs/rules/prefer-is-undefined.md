# prefer-is-undefined

Prefer [`isUndefined`](https://es-toolkit.dev/reference/predicate/isUndefined.html) from
es-toolkit over `value === undefined`.

## Rule details

This rule reports — it does **not** auto-fix — a check for `undefined` written by hand:

- a strict comparison (`===` or `!==`) with `undefined` or `void 0`, in either operand order;
- a `typeof value` comparison with `'undefined'`, using any of `===`, `==`, `!==` or `!=`, in
  either operand order (`typeof` always yields a string, so loose and strict are equivalent).

A negated check is replaced by `!isUndefined(value)`.

Loose `value == undefined` also matches `null`, so it is left to
[`prefer-is-nil`](./prefer-is-nil.md). A comparison that is one half of a combined
`null`/`undefined` check (`value === null || value === undefined`) is left to
[`prefer-is-nil`](./prefer-is-nil.md) / [`prefer-is-not-nil`](./prefer-is-not-nil.md), so the
pair is reported once. A `.filter(x => x !== undefined)` predicate is left to
[`prefer-without`](./prefer-without.md) (`without(arr, undefined)`).

### ❌ Incorrect

```js
value === undefined;
undefined !== value;
value === void 0;
typeof value === 'undefined';
typeof value != 'undefined';
```

### ✅ Correct

```js
import { isUndefined } from 'es-toolkit';

isUndefined(value);
!isUndefined(value);

// Left untouched:
value == undefined; // prefer-is-nil
value === null || value === undefined; // prefer-is-nil
arr.filter(x => x !== undefined); // prefer-without
value === 'undefined'; // a string, not the undefined value
```

## Limitations

- **Syntactic match.** `undefined` is matched by name, so a shadowed local `undefined`
  binding could produce a false positive. Only `void 0` is recognized among `void`
  expressions.
- **Undeclared variables.** `typeof value === 'undefined'` does not throw for an undeclared
  `value`, while `isUndefined(value)` does; the rule cannot tell whether `value` is declared.
- **Adjacent pairs only.** A pair is recognized when its halves sit next to each other in a
  `||` / `&&` chain; `value === null || ready || value === undefined` still reports the
  `undefined` half here.
- **Hand-off to prefer-without.** The `.filter(x => x !== undefined)` predicate is skipped even
  when prefer-without does not report it (disabled, or excluded by its `chainPosition` or
  `skipTypePredicate` options).
- **No auto-fix by design.** The fix requires adding an
  `import { isUndefined } from 'es-toolkit'`.
