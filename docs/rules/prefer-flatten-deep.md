# prefer-flatten-deep

Prefer [`flattenDeep`](https://es-toolkit.dev/reference/array/flattenDeep.html) over `arr.flat(Infinity)`.

## Rule details

This rule reports — it does **not** auto-fix — `arr.flat(Infinity)`.

### ❌ Incorrect

```js
items.flat(Infinity);
```

### ✅ Correct

```js
import { flattenDeep } from 'es-toolkit';

flattenDeep(items);

// Left untouched:
items.map(mapper).flat(Infinity); // see prefer-flat-map-deep
```

## Limitations

- Only the literal `Infinity` depth is matched.
- A one-argument `.map(callback)` receiver is skipped because
  [`prefer-flat-map-deep`](./prefer-flat-map-deep.md) reports the whole chain.
- No auto-fix is provided because adding imports is project-specific.
