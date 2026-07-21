# prefer-lower-first

Prefer [`lowerFirst`](https://es-toolkit.dev/reference/string/lowerFirst.html) over manually
lower-casing the first character.

## Rule details

### ❌ Incorrect

```js
name.charAt(0).toLowerCase() + name.slice(1);
```

### ✅ Correct

```js
import { lowerFirst } from 'es-toolkit/string';

lowerFirst(name);
```

## Limitations

- Both expressions must use the same syntactic receiver; different expressions are left untouched.
- No auto-fix is provided because adding the import is project-specific.
