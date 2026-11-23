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
[config].map(c => c().files).flat(); // one value: write `config().files` instead
```

## Limitations

- Only a one-level `flat()`/`flat(1)` directly following a one-argument `map()` is matched.
- A one-element array literal receiver (`[x].map(f).flat()`) is skipped: mapping a single
  value needs neither the array nor `flatMap`.
- No auto-fix is provided because adding imports is project-specific.
