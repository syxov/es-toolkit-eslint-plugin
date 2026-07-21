# prefer-sum-by

Prefer [`sumBy`](https://es-toolkit.dev/reference/math/sumBy.html) over a property-summing `reduce`.

## Rule details

```js
items.reduce((total, item) => total + item.price, 0);
sumBy(items, item => item.price);
```

## Limitations

- Only expression-body arrow reducers adding one direct item property are matched.
- The array-method chain-position configuration applies.
