# prefer-initial

Prefer [`initial`](https://es-toolkit.dev/reference/array/initial.html) over `arr.slice(0, -1)`.

## Rule details

### ❌ Incorrect

```js
items.slice(0, -1);
```

### ✅ Correct

```js
import { initial } from 'es-toolkit/array';

initial(items);
```

## Limitations

- The rule matches the syntax only and does not prove that the receiver is an array.
- No auto-fix is provided because adding the import is project-specific.
