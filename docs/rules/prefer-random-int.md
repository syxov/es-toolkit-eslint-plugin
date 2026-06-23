# prefer-random-int

Prefer [`randomInt`](https://es-toolkit.dev/reference/math/randomInt.html) from es-toolkit
over `Math.floor(Math.random() * …)`.

The `Math.floor(Math.random() * n)` family is the classic hand-rolled random-integer
formula; `randomInt` names the intent and removes the off-by-one foot-guns.

## Rule details

This rule reports — it does **not** auto-fix — a `Math.random() * …` product truncated to an
integer, whether by `Math.floor(...)`, `Math.trunc(...)`, `~~(...)`, or `… | 0`. A `.length`
multiplier is left to [`prefer-sample`](./prefer-sample.md) instead.

### ❌ Incorrect

```js
Math.floor(Math.random() * 6);
Math.trunc(Math.random() * 6);
~~(Math.random() * 6);
(Math.random() * 6) | 0;
Math.floor(Math.random() * (max - min + 1)) + min;
```

### ✅ Correct

```js
import { randomInt } from 'es-toolkit';

randomInt(0, 6);

// Not this rule's concern — left untouched:
Math.random(); // a float in [0, 1)
Math.round(Math.random() * n); // rounds, not truncates
Math.ceil(Math.random() * n); // changes the bounds
arr[Math.floor(Math.random() * arr.length)]; // see prefer-sample
```

## Limitations

- **Bounds differ.** The inclusive idiom `Math.floor(Math.random() * (max - min + 1)) + min`
  yields `[min, max]`, whereas `randomInt(min, max)` yields `[min, max)`. Adjust the upper
  bound when rewriting.
- **Truncation only.** `Math.floor`, `Math.trunc`, `~~`, and `| 0` are reported (all truncate
  toward zero for the non-negative `Math.random() * n` range). `Math.round(...)` and
  `Math.ceil(...)` are **not** — they change the distribution or bounds.
- **Syntactic match.** A shadowed local `Math` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { randomInt } from 'es-toolkit'`.
