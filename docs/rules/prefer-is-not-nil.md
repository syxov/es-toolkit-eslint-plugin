# prefer-is-not-nil

Prefer [`isNotNil`](https://es-toolkit.dev/reference/predicate/isNotNil.html) over `value != null`.

## Rule details

### ❌ Incorrect

```js
value != null;
```

### ✅ Correct

```js
import { isNotNil } from 'es-toolkit/predicate';

isNotNil(value);
```

## Limitations

- Only the conventional loose comparison against `null` is matched; strict comparisons are left untouched.
- No auto-fix is provided because adding the import is project-specific.
