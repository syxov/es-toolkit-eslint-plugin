# prefer-is-string

Prefer [`isString`](https://es-toolkit.dev/reference/predicate/isString.html) over
`typeof value === 'string'`.

## Rule details

### ❌ Incorrect

```js
typeof value === 'string';
```

### ✅ Correct

```js
import { isString } from 'es-toolkit/predicate';

isString(value);
```

## Limitations

- Only strict equality comparisons with the matching `typeof` result are matched.
- No auto-fix is provided because adding the import is project-specific.
