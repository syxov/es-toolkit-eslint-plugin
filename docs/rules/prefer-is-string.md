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

### Not reported

```ts
// Feature detection: `typeof` is the one safe read of a global that may be missing.
typeof __dirname === 'string';
// One value tested against several types.
typeof v === 'string' || typeof v === 'number';
// A test assertion.
expect(typeof value === 'string').toBe(true);
// The code already has its own `isString`.
const isString = typeof token === 'string';
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'string'` is not reported.
- **Undeclared globals.** A bare `typeof x` operand is treated as declared only when the code
  declares it (variable, function, class, import or parameter). Built-in and configured
  globals, `/* global */` comments, `declare global` members and ambient `declare` statements
  may be missing at runtime, so their `typeof` checks are left alone. A member operand such as
  `typeof window.foo` is still reported: it throws on an undeclared `window` either way.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isString` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isString` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isString } from 'es-toolkit'`.
