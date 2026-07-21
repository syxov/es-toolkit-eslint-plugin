# prefer-mean-by

Prefer [`meanBy`](https://es-toolkit.dev/reference/math/meanBy.html) over a property-summing `reduce` divided by the same array's length.

## Limitations

- Only expression-body arrow reducers adding one direct item property are matched.
- The array-method chain-position configuration applies.
