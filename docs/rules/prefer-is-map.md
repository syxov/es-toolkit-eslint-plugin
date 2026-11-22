# prefer-is-map

Prefer [`isMap`](https://es-toolkit.dev/reference/predicate/isMap.html) from es-toolkit over
`value instanceof Map`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Map` identifier. A negated check `!(value instanceof Map)` is replaced by
`!isMap(value)`.

### ❌ Incorrect

```js
value instanceof Map;
!(value instanceof Map);
```

### ✅ Correct

```js
import { isMap } from 'es-toolkit';

isMap(value);
!isMap(value);

// Not a plain `Map` check — left untouched:
value instanceof MapLike;
value instanceof window.Map;
```

## Limitations

- **Syntactic match.** `Map` is matched by name, so a shadowed local `Map` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Map` or `globalThis.Map`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isMap } from 'es-toolkit'`.
