# prefer-is-reg-exp

Prefer [`isRegExp`](https://es-toolkit.dev/reference/predicate/isRegExp.html) from es-toolkit over
`value instanceof RegExp`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `RegExp` identifier. A negated check `!(value instanceof RegExp)` is replaced by
`!isRegExp(value)`.

### ❌ Incorrect

```js
value instanceof RegExp;
!(value instanceof RegExp);
```

### ✅ Correct

```js
import { isRegExp } from 'es-toolkit';

isRegExp(value);
!isRegExp(value);

// Not a plain `RegExp` check — left untouched:
value instanceof RegExpLike;
value instanceof window.RegExp;
```

### Not reported

```ts
// One value tested against several types.
value instanceof String || value instanceof RegExp;
typeof value === 'string' || value instanceof RegExp;
// A test assertion.
expect(value instanceof RegExp).toBe(true);
// The code already has its own `isRegExp`.
const isRegExp = (value: unknown) => value instanceof RegExp;
```

## Limitations

- **Syntactic match.** `RegExp` is matched by name, so a shadowed local `RegExp` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.RegExp` or `globalThis.RegExp`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isRegExp` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isRegExp` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isRegExp } from 'es-toolkit'`.
