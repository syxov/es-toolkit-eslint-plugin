# prefer-is-nil

Prefer [`isNil`](https://es-toolkit.dev/reference/predicate/isNil.html) over `value == null`.

## Rule details

### ❌ Incorrect

```js
value == null;
```

### ✅ Correct

```js
import { isNil } from 'es-toolkit/predicate';

isNil(value);
```

## Limitations

- Only the conventional loose comparison against `null` is matched; strict comparisons are left untouched.
- No auto-fix is provided because adding the import is project-specific.
