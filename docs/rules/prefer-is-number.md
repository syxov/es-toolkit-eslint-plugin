# prefer-is-number

Prefer [`isNumber`](https://es-toolkit.dev/reference/predicate/isNumber.html) from es-toolkit over
`typeof value === 'number'`.

`isNumber(value)` names the check and narrows the type in TypeScript, without a string literal
that a typo can silently break.

## Rule details

This rule reports — it does **not** auto-fix — a comparison of a `typeof` expression with
`'number'`, using any of `===`, `==`, `!==` or `!=`, in either operand order. `typeof` always
yields a string, so loose and strict comparisons are equivalent here. A negated check is
replaced by `!isNumber(value)`.

### ❌ Incorrect

```js
typeof value === 'number';
typeof value == 'number';
'number' === typeof value;
typeof value !== 'number';
```

### ✅ Correct

```js
import { isNumber } from 'es-toolkit';

isNumber(value);
!isNumber(value);

// Not a 'number' check — left untouched:
typeof value === 'string';
typeof value === kind;
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'number'` is not reported.
- **No auto-fix by design.** The fix requires adding an `import { isNumber } from 'es-toolkit'`.
