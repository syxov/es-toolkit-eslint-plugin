# prefer-is-boolean

Prefer [`isBoolean`](https://es-toolkit.dev/reference/predicate/isBoolean.html) over
`typeof value === 'boolean'`.

## Rule details

### ❌ Incorrect

```js
typeof value === 'boolean';
```

### ✅ Correct

```js
import { isBoolean } from 'es-toolkit/predicate';

isBoolean(value);
```

## Limitations

- Only strict equality comparisons with the matching `typeof` result are matched.
- No auto-fix is provided because adding the import is project-specific.
