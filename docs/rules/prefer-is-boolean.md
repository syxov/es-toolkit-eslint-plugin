# prefer-is-boolean

Prefer [`isBoolean`](https://es-toolkit.dev/reference/predicate/isBoolean.html) from es-toolkit over
`typeof value === 'boolean'`.

`isBoolean(value)` names the check and narrows the type in TypeScript, without a string literal
that a typo can silently break.

## Rule details

This rule reports — it does **not** auto-fix — a comparison of a `typeof` expression with
`'boolean'`, using any of `===`, `==`, `!==` or `!=`, in either operand order. `typeof` always
yields a string, so loose and strict comparisons are equivalent here. A negated check is
replaced by `!isBoolean(value)`.

### ❌ Incorrect

```js
typeof value === 'boolean';
typeof value == 'boolean';
'boolean' === typeof value;
typeof value !== 'boolean';
```

### ✅ Correct

```js
import { isBoolean } from 'es-toolkit';

isBoolean(value);
!isBoolean(value);

// Not a 'boolean' check — left untouched:
typeof value === 'string';
typeof value === kind;
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'boolean'` is not reported.
- **No auto-fix by design.** The fix requires adding an `import { isBoolean } from 'es-toolkit'`.
