# prefer-is-file

Prefer [`isFile`](https://es-toolkit.dev/reference/predicate/isFile.html) from es-toolkit over
`value instanceof File`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `File` identifier. A negated check `!(value instanceof File)` is replaced by
`!isFile(value)`.

### ❌ Incorrect

```js
value instanceof File;
!(value instanceof File);
```

### ✅ Correct

```js
import { isFile } from 'es-toolkit';

isFile(value);
!isFile(value);

// Not a plain `File` check — left untouched:
value instanceof FileLike;
value instanceof window.File;
```

## Limitations

- **Syntactic match.** `File` is matched by name, so a shadowed local `File` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.File` or `globalThis.File`
  are not reported.
- **No auto-fix by design.** The fix requires adding an `import { isFile } from 'es-toolkit'`.
