# prefer-compact

Prefer [`compact`](https://es-toolkit.dev/reference/array/compact.html) from es-toolkit
over `.filter(Boolean)`.

`compact(arr)` removes all falsy values (`false`, `null`, `0`, `''`, `undefined`, `NaN`) —
exactly what `arr.filter(Boolean)` does, but named and (in TypeScript) better typed.

## Rule details

This rule reports — it does **not** auto-fix — a single-argument `.filter(Boolean)` call.

### ❌ Incorrect

```js
arr.filter(Boolean);
items.filter(Boolean).map(x => x.id);
```

### ✅ Correct

```js
import { compact } from 'es-toolkit';

compact(arr);

// Not a falsy filter — left untouched:
arr.filter(x => x);
arr.map(Boolean);
```

## Limitations

- **Syntactic match.** A shadowed local `Boolean` could produce a false positive. This is
  rare in practice.
- **TypeScript bonus.** Beyond readability, `compact` narrows nullable element types, while
  `filter(Boolean)` often leaves them un-narrowed.
- **No auto-fix by design.** The fix requires adding an `import { compact } from 'es-toolkit'`.
