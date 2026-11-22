# prefer-flat-map

Prefer [`flatMap`](https://es-toolkit.dev/reference/array/flatMap.html) over `arr.map(callback).flat()`.

## Rule details

This rule reports — it does **not** auto-fix — `arr.map(callback).flat()` and
`arr.map(callback).flat(1)`.

### ❌ Incorrect

```js
items.map(mapper).flat();
items.map(mapper).flat(1);
```

### ✅ Correct

```js
import { flatMap } from 'es-toolkit';

flatMap(items, mapper);

// Left untouched:
items.map(mapper, thisArg).flat(); // `thisArg` has no flatMap equivalent
items.map(mapper).flat(Infinity); // see prefer-flat-map-deep
```

## Limitations

- Only a one-level `flat()`/`flat(1)` directly following a one-argument `map()` is matched.
- No auto-fix is provided because adding imports is project-specific.
