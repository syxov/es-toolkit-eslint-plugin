# prefer-flat-map-deep

Prefer [`flatMapDeep`](https://es-toolkit.dev/reference/array/flatMapDeep.html) over `arr.map(callback).flat(Infinity)`.

## Limitations

- Only an immediate `map(...).flat(Infinity)` chain is matched.
