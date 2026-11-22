# prefer-is-weak-set

Prefer [`isWeakSet`](https://es-toolkit.dev/reference/predicate/isWeakSet.html) from es-toolkit over
`value instanceof WeakSet`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `WeakSet` identifier. A negated check `!(value instanceof WeakSet)` is replaced by
`!isWeakSet(value)`.

### ❌ Incorrect

```js
value instanceof WeakSet;
!(value instanceof WeakSet);
```

### ✅ Correct

```js
import { isWeakSet } from 'es-toolkit';

isWeakSet(value);
!isWeakSet(value);

// Not a plain `WeakSet` check — left untouched:
value instanceof WeakSetLike;
value instanceof window.WeakSet;
```

## Limitations

- **Syntactic match.** `WeakSet` is matched by name, so a shadowed local `WeakSet` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.WeakSet` or `globalThis.WeakSet`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isWeakSet } from 'es-toolkit'`.
