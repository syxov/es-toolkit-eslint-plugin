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

## Limitations

- **Syntactic match.** `RegExp` is matched by name, so a shadowed local `RegExp` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.RegExp` or `globalThis.RegExp`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isRegExp } from 'es-toolkit'`.
