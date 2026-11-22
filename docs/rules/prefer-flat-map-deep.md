# prefer-flat-map-deep

Prefer [`flatMapDeep`](https://es-toolkit.dev/reference/array/flatMapDeep.html) over `arr.map(callback).flat(Infinity)`.

## Rule details

This rule reports — it does **not** auto-fix — `arr.map(callback).flat(Infinity)`.

### ❌ Incorrect

```js
items.map(mapper).flat(Infinity);
```

### ✅ Correct

```js
import { flatMapDeep } from 'es-toolkit';

flatMapDeep(items, mapper);
```

## Limitations

- Only an immediate one-argument `map(...).flat(Infinity)` chain is matched.
- No auto-fix is provided because adding imports is project-specific.
