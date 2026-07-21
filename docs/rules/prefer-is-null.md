# prefer-is-null

Prefer [`isNull`](https://es-toolkit.dev/reference/predicate/isNull.html) over `value === null`.

## Rule details

### ❌ Incorrect

```js
value === null;
```

### ✅ Correct

```js
import { isNull } from 'es-toolkit/predicate';

isNull(value);
```

## Limitations

- Only strict comparisons with the literal `null` are matched.
- No auto-fix is provided because adding the import is project-specific.
