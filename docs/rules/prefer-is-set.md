# prefer-is-set

Prefer [`isSet`](https://es-toolkit.dev/reference/predicate/isSet.html) from es-toolkit over
`value instanceof Set`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Set` identifier. A negated check `!(value instanceof Set)` is replaced by
`!isSet(value)`.

### ❌ Incorrect

```js
value instanceof Set;
!(value instanceof Set);
```

### ✅ Correct

```js
import { isSet } from 'es-toolkit';

isSet(value);
!isSet(value);

// Not a plain `Set` check — left untouched:
value instanceof SetLike;
value instanceof window.Set;
```

## Limitations

- **Syntactic match.** `Set` is matched by name, so a shadowed local `Set` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Set` or `globalThis.Set`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isSet } from 'es-toolkit'`.
