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

### Not reported

```ts
// One value tested against several types.
value instanceof Blob || value instanceof File;
typeof value === 'string' || value instanceof File;
// A test assertion.
expect(value instanceof File).toBe(true);
// The code already has its own `isFile`.
const isFile = (value: unknown) => value instanceof File;
```

## Limitations

- **Syntactic match.** `File` is matched by name, so a shadowed local `File` binding could
  produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.File` or `globalThis.File`
  are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isFile` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isFile` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isFile } from 'es-toolkit'`.
