# prefer-tail

Prefer [`tail`](https://es-toolkit.dev/reference/array/tail.html) over `arr.slice(1)`.

## Rule details

### ❌ Incorrect

```js
items.slice(1);
```

### ✅ Correct

```js
import { tail } from 'es-toolkit/array';

tail(items);
```

## Limitations

- The rule matches the syntax only and does not prove that the receiver is an array.
- No auto-fix is provided because adding the import is project-specific.
