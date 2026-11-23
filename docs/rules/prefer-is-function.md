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

### Not reported

```ts
// Feature detection: `typeof` is the one safe read of a global that may be missing.
typeof requestAnimationFrame === 'function';
// One value tested against several types.
typeof v === 'object' || typeof v === 'function';
// A test assertion.
expect(typeof value === 'function').toBe(true);
// The code already has its own `isFunction`.
const isFunction = typeof token === 'function';
```

## Limitations

- **String literals only.** The type name must be a plain string literal; a template literal
  or a variable holding `'function'` is not reported.
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
- **Own helper in scope.** When the code already sees a binding named `isFunction` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isFunction` from `es-toolkit` does
  not count.
- **Constructor types (TypeScript).** `isFunction` narrows to `(...args: any[]) => any`. On a
  union that contains a construct-only type (`new () => T`, `abstract new`, `typeof SomeClass`,
  a `ComponentClass`) or `Function`, the true branch loses the construct signature
  (`new value()` no longer type-checks) and the false branch keeps the constructor, where
  `typeof` removes it. The rule has no type information to tell; keep `typeof` there.
- **No auto-fix by design.** The fix requires adding an `import { isFunction } from 'es-toolkit'`.
