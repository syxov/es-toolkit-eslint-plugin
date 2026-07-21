# prefer-in-range

Prefer [`inRange`](https://es-toolkit.dev/reference/math/inRange.html) over a manual lower- and upper-bound check.

## Rule details

```js
// Incorrect
value >= start && value < end;

// Correct
inRange(value, start, end);
```

## Limitations

- The rule matches only `value >= start && value < end` in that order and requires identical syntactic value expressions.
- No auto-fix is provided because adding imports is project-specific.
