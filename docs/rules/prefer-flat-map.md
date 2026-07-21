# prefer-flat-map

Prefer [`flatMap`](https://es-toolkit.dev/reference/array/flatMap.html) over `arr.map(callback).flat()`.

## Rule details

```js
// Incorrect
items.map(mapper).flat();

// Correct
flatMap(items, mapper);
```

## Limitations

- Only a one-level `flat()` directly following `map()` is matched.
- No auto-fix is provided because adding imports is project-specific.
