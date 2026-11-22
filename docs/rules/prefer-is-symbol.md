# prefer-is-symbol

Prefer [`isSymbol`](https://es-toolkit.dev/reference/predicate/isSymbol.html) from es-toolkit over
`typeof value === 'symbol'`.

`isSymbol(value)` names the check and narrows the type in TypeScript, without a string literal
that a typo can silently break.

## Rule details

This rule reports — it does **not** auto-fix — a comparison of a `typeof` expression with
`'symbol'`, using any of `===`, `==`, `!==` or `!=`, in either operand order. `typeof` always
yields a string, so loose and strict comparisons are equivalent here. A negated check is
replaced by `!isSymbol(value)`.

### ❌ Incorrect

```js
typeof value === 'symbol';
typeof value == 'symbol';
'symbol' === typeof value;
typeof value !== 'symbol';
```

### ✅ Correct

```js
import { isSymbol } from 'es-toolkit';

isSymbol(value);
!isSymbol(value);

// Not a 'symbol' check — left untouched:
typeof value === 'string';
typeof value === kind;
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'symbol'` is not reported.
- **No auto-fix by design.** The fix requires adding an `import { isSymbol } from 'es-toolkit'`.
