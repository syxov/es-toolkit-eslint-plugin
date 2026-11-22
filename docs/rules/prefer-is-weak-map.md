# prefer-is-weak-map

Prefer [`isWeakMap`](https://es-toolkit.dev/reference/predicate/isWeakMap.html) from es-toolkit over
`value instanceof WeakMap`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `WeakMap` identifier. A negated check `!(value instanceof WeakMap)` is replaced by
`!isWeakMap(value)`.

### ❌ Incorrect

```js
value instanceof WeakMap;
!(value instanceof WeakMap);
```

### ✅ Correct

```js
import { isWeakMap } from 'es-toolkit';

isWeakMap(value);
!isWeakMap(value);

// Not a plain `WeakMap` check — left untouched:
value instanceof WeakMapLike;
value instanceof window.WeakMap;
```

## Limitations

- **Syntactic match.** `WeakMap` is matched by name, so a shadowed local `WeakMap` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.WeakMap` or `globalThis.WeakMap`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isWeakMap } from 'es-toolkit'`.
