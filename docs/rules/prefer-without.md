# prefer-without

Prefer [`without`](https://es-toolkit.dev/reference/array/without.html) from es-toolkit
over `arr.filter(x => x !== value)`.

Removing specific values from an array is `without(arr, value)` — named, and it accepts
several values at once.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose
body is a `!==`/`!=` comparison between the parameter itself and some other value.

### ❌ Incorrect

```js
arr.filter(x => x !== value);
arr.filter(x => value !== x);
arr.filter(x => x != null);
```

### ✅ Correct

```js
import { without } from 'es-toolkit';

without(arr, value);

// Not a `without` — left untouched:
arr.filter(x => x.id !== value); // compares a property, not the element
arr.filter(x => x === value); // keeps the value rather than removing it
```

## Limitations

- **Element comparison only.** Exactly one side of the comparison must be the predicate's
  own parameter, so `x => x.id !== value` is left alone.
- **Single value.** Multi-value chains (`x => x !== a && x !== b`) are not matched, even
  though `without(arr, a, b)` would cover them.
- **`!==` and `!=`.** Both inequality operators are reported; mind that `!= null` removes
  `null` and `undefined`, whereas `without(arr, null)` removes only `null`.
- **No auto-fix by design.** The fix requires adding an
  `import { without } from 'es-toolkit'`.
