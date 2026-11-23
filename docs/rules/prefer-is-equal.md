# prefer-is-equal

Prefer [`isEqual`](https://es-toolkit.dev/reference/predicate/isEqual.html) from es-toolkit
over comparing `JSON.stringify` output.

Comparing `JSON.stringify(a) === JSON.stringify(b)` is a common but fragile deep-equality
check: it depends on key order, silently drops `undefined`/functions, and throws on circular
references. `isEqual(a, b)` performs a real structural comparison.

## Rule details

This rule reports — it does **not** auto-fix — an equality/inequality comparison (`===`,
`==`, `!==`, `!=`) whose both operands are single-argument `JSON.stringify(...)` calls. A
negated check is replaced by `!isEqual(a, b)`.

### ❌ Incorrect

```js
JSON.stringify(a) === JSON.stringify(b);
JSON.stringify(x) !== JSON.stringify(y);
```

### ✅ Correct

```js
import { isEqual } from 'es-toolkit';

isEqual(a, b);
!isEqual(x, y);

// Not a plain stringify-based comparison — left untouched:
JSON.stringify(a) === b;
JSON.parse(a) === JSON.parse(b);
JSON.stringify(a, replacer) === JSON.stringify(b, replacer);
```

## Limitations

- **Both operands must be `JSON.stringify`.** Comparing one stringified value against
  something else is not reported.
- **Single argument only.** A replacer or indentation argument changes what is compared, so
  `JSON.stringify(a, replacer) === JSON.stringify(b, replacer)` is not reported.
- **Not a drop-in replacement.** `isEqual` ignores key order (usually wanted) but, unlike
  `JSON.stringify`, tells `{ a: undefined }` from `{}`, compares functions by identity, ignores
  `toJSON` (date-library objects are compared by their internals), treats `NaN` as equal to
  `NaN`, sees `Map` / `Set` contents and does not throw on cycles. A deliberately approximate
  comparison — such as a dev warning that a default value changed between renders — changes
  meaning with `isEqual`; keep `JSON.stringify` there. The rule cannot tell that intent.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isEqual` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isEqual` from `es-toolkit` does
  not count.
- **No auto-fix by design.** The fix requires adding an `import { isEqual } from 'es-toolkit'`
  (and inverting with `!` for the `!==` case).
