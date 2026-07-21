# prefer-is-symbol

Prefer [`isSymbol`](https://es-toolkit.dev/reference/predicate/isSymbol.html) over
`typeof value === 'symbol'`.

## Rule details

### ❌ Incorrect

```js
typeof value === 'symbol';
```

### ✅ Correct

```js
import { isSymbol } from 'es-toolkit/predicate';

isSymbol(value);
```

## Limitations

- Only strict equality comparisons with the matching `typeof` result are matched.
- No auto-fix is provided because adding the import is project-specific.
