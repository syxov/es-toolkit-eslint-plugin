# prefer-head

Prefer [`head`](https://es-toolkit.dev/reference/array/head.html) over `arr[0]`.

## Rule details

### ❌ Incorrect

```js
items[0];
```

### ✅ Correct

```js
import { head } from 'es-toolkit/array';

head(items);
```

## Limitations

- The rule syntactically matches any computed `[0]` access; it does not prove that the receiver is an array.
- No auto-fix is provided because adding the import is project-specific.
