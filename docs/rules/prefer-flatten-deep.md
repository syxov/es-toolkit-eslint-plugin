# prefer-flatten-deep

Prefer [`flattenDeep`](https://es-toolkit.dev/reference/array/flattenDeep.html) over `arr.flat(Infinity)`.

## Rule details

```js
// Incorrect
items.flat(Infinity);

// Correct
flattenDeep(items);
```

## Limitations

- Only the literal `Infinity` depth is matched.
- No auto-fix is provided because adding imports is project-specific.
