# prefer-random-int

Prefer [`randomInt`](https://es-toolkit.dev/reference/math/randomInt.html) from es-toolkit
over `Math.floor(Math.random() * …)`.

The `Math.floor(Math.random() * n)` family is the classic hand-rolled random-integer
formula; `randomInt` names the intent and removes the off-by-one foot-guns.

## Rule details

This rule reports — it does **not** auto-fix — `Math.floor(...)` applied to a multiplication
that contains `Math.random()`. A `.length` multiplier is left to
[`prefer-sample`](./prefer-sample.md) instead.

### ❌ Incorrect

```js
Math.floor(Math.random() * 6);
Math.floor(Math.random() * (max - min + 1)) + min;
```

### ✅ Correct

```js
import { randomInt } from 'es-toolkit';

randomInt(0, 6);

// Not this rule's concern — left untouched:
Math.random(); // a float in [0, 1)
Math.round(Math.random() * n); // rounds, not floors
arr[Math.floor(Math.random() * arr.length)]; // see prefer-sample
```

## Limitations

- **Bounds differ.** The inclusive idiom `Math.floor(Math.random() * (max - min + 1)) + min`
  yields `[min, max]`, whereas `randomInt(min, max)` yields `[min, max)`. Adjust the upper
  bound when rewriting.
- **`floor` only.** The `Math.round(...)` variant is not reported (it has a non-uniform
  distribution and is a different intent).
- **Syntactic match.** A shadowed local `Math` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { randomInt } from 'es-toolkit'`.
