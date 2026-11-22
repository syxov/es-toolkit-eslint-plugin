# prefer-flatten

Prefer [`flatten`](https://es-toolkit.dev/reference/array/flatten.html) over `arr.flat()`.

## Rule details

This rule reports — it does **not** auto-fix — `arr.flat()` and `arr.flat(1)`.

### ❌ Incorrect

```js
items.flat();
items.flat(1);
```

### ✅ Correct

```js
import { flatten } from 'es-toolkit';

flatten(items);

// Left untouched:
items.flat(2); // a deeper fixed depth
items.map(mapper).flat(); // see prefer-flat-map
```

## Limitations

- Only the default depth and a literal `1` are matched; `flat(depth)` with a variable is not.
- A one-argument `.map(callback)` receiver is skipped because
  [`prefer-flat-map`](./prefer-flat-map.md) reports the whole chain.
- No auto-fix is provided because adding imports is project-specific.
