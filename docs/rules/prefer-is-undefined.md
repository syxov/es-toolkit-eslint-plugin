# prefer-is-undefined

Prefer [`isUndefined`](https://es-toolkit.dev/reference/predicate/isUndefined.html) over
`value === undefined`.

## Rule details

### ❌ Incorrect

```js
value === undefined;
```

### ✅ Correct

```js
import { isUndefined } from 'es-toolkit/predicate';

isUndefined(value);
```

## Limitations

- The rule matches the identifier spelling `undefined`; a shadowed local binding is a known syntactic false positive.
- No auto-fix is provided because adding the import is project-specific.
