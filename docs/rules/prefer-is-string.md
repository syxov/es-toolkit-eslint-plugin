# prefer-is-string

Prefer [`isString`](https://es-toolkit.dev/reference/predicate/isString.html) from es-toolkit over
`typeof value === 'string'`.

`isString(value)` names the check and narrows the type in TypeScript, without a string literal
that a typo can silently break.

## Rule details

This rule reports — it does **not** auto-fix — a comparison of a `typeof` expression with
`'string'`, using any of `===`, `==`, `!==` or `!=`, in either operand order. `typeof` always
yields a string, so loose and strict comparisons are equivalent here. A negated check is
replaced by `!isString(value)`.

### ❌ Incorrect

```js
typeof value === 'string';
typeof value == 'string';
'string' === typeof value;
typeof value !== 'string';
```

### ✅ Correct

```js
import { isString } from 'es-toolkit';

isString(value);
!isString(value);

// Not a 'string' check — left untouched:
typeof value === 'number';
typeof value === kind;
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'string'` is not reported.
- **No auto-fix by design.** The fix requires adding an `import { isString } from 'es-toolkit'`.
