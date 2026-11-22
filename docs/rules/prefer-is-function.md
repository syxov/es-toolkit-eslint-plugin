# prefer-is-function

Prefer [`isFunction`](https://es-toolkit.dev/reference/predicate/isFunction.html) from es-toolkit over
`typeof value === 'function'`.

`isFunction(value)` names the check and narrows the type in TypeScript, without a string literal
that a typo can silently break.

## Rule details

This rule reports — it does **not** auto-fix — a comparison of a `typeof` expression with
`'function'`, using any of `===`, `==`, `!==` or `!=`, in either operand order. `typeof` always
yields a string, so loose and strict comparisons are equivalent here. A negated check is
replaced by `!isFunction(value)`.

### ❌ Incorrect

```js
typeof value === 'function';
typeof value == 'function';
'function' === typeof value;
typeof value !== 'function';
```

### ✅ Correct

```js
import { isFunction } from 'es-toolkit';

isFunction(value);
!isFunction(value);

// Not a 'function' check — left untouched:
typeof value === 'object';
typeof value === kind;
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'function'` is not reported.
- **No auto-fix by design.** The fix requires adding an `import { isFunction } from 'es-toolkit'`.
