# prefer-is-function

Prefer [`isFunction`](https://es-toolkit.dev/reference/predicate/isFunction.html) over `typeof value === 'function'`.

## Rule details

```js
// Incorrect
typeof value === 'function';

// Correct
isFunction(value);
```

## Limitations

- Only strict equality comparisons with the matching `typeof` result are matched.
- No auto-fix is provided because adding imports is project-specific.
