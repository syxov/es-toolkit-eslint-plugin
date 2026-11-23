# prefer-random-int

Prefer [`randomInt`](https://es-toolkit.dev/reference/math/randomInt.html) from es-toolkit
over `Math.floor(Math.random() * …)`.

The `Math.floor(Math.random() * n)` family is the classic hand-rolled random-integer
formula; `randomInt` names the intent and removes the off-by-one foot-guns.

## Rule details

This rule reports — it does **not** auto-fix — a `Math.random() * …` product truncated to an
integer, whether by `Math.floor(...)`, `Math.trunc(...)`, `~~(...)`, or `… | 0`. The one
exception is a random element pick `arr[Math.floor(Math.random() * arr.length)]`, which
[`prefer-sample`](./prefer-sample.md) reports instead.

### ❌ Incorrect

```js
Math.floor(Math.random() * 6);
Math.trunc(Math.random() * 6);
~~(Math.random() * 6);
(Math.random() * 6) | 0;
Math.floor(Math.random() * (max - min + 1)) + min;
const j = Math.floor(Math.random() * arr.length); // a random index → randomInt(0, arr.length)
a[Math.floor(Math.random() * (a.length - 1))]; // not a whole-array sample
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

// A Fisher–Yates shuffle: the loop swaps elements, so `shuffle` is the utility.
for (let i = a.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [a[i], a[j]] = [a[j], a[i]];
}
```

## Limitations

- **Bounds differ.** The inclusive idiom `Math.floor(Math.random() * (max - min + 1)) + min`
  yields `[min, max]`, whereas `randomInt(min, max)` yields `[min, max)`. Adjust the upper
  bound when rewriting.
- **`randomInt` throws for an empty range.** `randomInt(max)` requires `max > 0`:
  `randomInt(0)` throws `Invalid input: The maximum value must be greater than the minimum
value.`, while `Math.floor(Math.random() * 0)` returns `0`. When the multiplier can be `0`
  or negative (`arr.length` of a possibly empty array, `end - start` with `end === start`),
  guard the call before rewriting.
- **Shuffle loops.** A truncated random index inside a loop whose body swaps two elements
  (`[a[i], a[j]] = [a[j], a[i]]` or `a[i] = a[j]`) is a Fisher–Yates shuffle and is not
  reported. No rule reports the shuffle loop itself; consider `shuffle` from es-toolkit.
- **Truncation only.** `Math.floor`, `Math.trunc`, `~~`, and `| 0` are reported (all truncate
  toward zero for the non-negative `Math.random() * n` range). `Math.round(...)` and
  `Math.ceil(...)` are **not** — they change the distribution or bounds.
- **Syntactic match.** A shadowed local `Math` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { randomInt } from 'es-toolkit'`.
