# prefer-is-number

Prefer [`isNumber`](https://es-toolkit.dev/reference/predicate/isNumber.html) over
`typeof value === 'number'`.

## Rule details

### ❌ Incorrect

```js
typeof value === 'number';
```

### ✅ Correct

```js
import { isNumber } from 'es-toolkit/predicate';

isNumber(value);
```

## Limitations

- Only strict equality comparisons with the matching `typeof` result are matched.
- No auto-fix is provided because adding the import is project-specific.
