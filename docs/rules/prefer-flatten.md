# prefer-flatten

Prefer [`flatten`](https://es-toolkit.dev/reference/array/flatten.html) over `arr.flat()`.

## Rule details

```js
// Incorrect
items.flat();

// Correct
flatten(items);
```

## Limitations

- Only `flat()` with its default depth is matched.
- No auto-fix is provided because adding imports is project-specific.
