# prefer-delay

Prefer [`delay`](https://es-toolkit.dev/reference/promise/delay.html) from es-toolkit over
wrapping `setTimeout` in a `new Promise`.

`delay(ms)` returns a promise that resolves after `ms` milliseconds — the same thing as the
hand-rolled `new Promise((resolve) => setTimeout(resolve, ms))` sleep idiom.

## Rule details

This rule reports — it does **not** auto-fix — a `new Promise` whose single-parameter
executor immediately calls `setTimeout` with that same parameter as the callback.

### ❌ Incorrect

```js
new Promise(resolve => setTimeout(resolve, 1000));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
```

### ✅ Correct

```js
import { delay } from 'es-toolkit';

await delay(1000);

// Not a pure delay — left untouched:
new Promise(resolve => setTimeout(doWork, 1000)); // runs work, not just a delay
new Promise(resolve => {
  setTimeout(resolve, ms); // block-bodied executor, see Limitations
});
```

## Limitations

- **Expression-body executor only.** The block-bodied form
  `new Promise((resolve) => { setTimeout(resolve, ms); })` and wrapped forms like
  `setTimeout(() => resolve(), ms)` are not reported, to keep the rule precise.
- **Identity-checked.** The rule reports only when `setTimeout`'s callback is the promise's
  own `resolve` parameter, so `setTimeout(doWork, ms)` inside a `new Promise` is left alone.
- **No auto-fix by design.** The fix requires adding an `import { delay } from 'es-toolkit'`.
