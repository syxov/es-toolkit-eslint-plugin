# prefer-delay

Prefer [`delay`](https://es-toolkit.dev/reference/promise/delay.html) from es-toolkit over
wrapping `setTimeout` in a `new Promise`.

`delay(ms)` returns a promise that resolves after `ms` milliseconds — the same thing as the
hand-rolled `new Promise((resolve) => setTimeout(resolve, ms))` sleep idiom.

## Rule details

This rule reports — it does **not** auto-fix — a `new Promise` whose executor:

- is an arrow function or a function expression with a single parameter (`resolve`);
- consists of one two-argument `setTimeout(callback, ms)` call, as an expression body or a
  single-statement block body;
- passes a `callback` that only resolves: `resolve` itself, or a zero-parameter arrow
  that calls `resolve()` with no arguments (`() => resolve()` or `() => { resolve(); }`).

### ❌ Incorrect

```js
new Promise(resolve => setTimeout(resolve, 1000));
new Promise(resolve => {
  setTimeout(resolve, ms);
});
new Promise(resolve => setTimeout(() => resolve(), ms));
new Promise(function (resolve) {
  setTimeout(resolve, ms);
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
```

### ✅ Correct

```js
import { delay } from 'es-toolkit';

await delay(1000);

// Not a pure delay — left untouched:
new Promise(resolve => setTimeout(doWork, 1000)); // runs work, not just a delay
new Promise(resolve => setTimeout(() => resolve(value), ms)); // resolves with a value
new Promise(resolve => setTimeout(resolve, ms, value)); // resolves with a value
new Promise((resolve, reject) => setTimeout(resolve, ms)); // also takes `reject`
new Promise(resolve => {
  doWork();
  setTimeout(resolve, ms); // does more than wait, see Limitations
});

// Serialised and run in the browser page, where an imported `delay` is not defined:
await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 150)));
```

## Limitations

- **Single-statement executors only.** A block body that does more than the one `setTimeout`
  (e.g. `new Promise((resolve) => { doWork(); setTimeout(resolve, ms); })`) is not
  reported, to keep the rule precise.
- **Arrow callbacks only.** A `function () { resolve(); }` timeout callback is not matched;
  `resolve` itself or a zero-parameter arrow calling `resolve()` is.
- **Identity-checked by name.** The rule reports only when the timeout callback is, or
  calls, the executor's own parameter, so `setTimeout(doWork, ms)` inside a `new Promise` is
  left alone.
- **Browser-evaluated callbacks are recognised by method name.** Code inside a function
  passed directly to `.evaluate`, `.evaluateHandle`, `.evaluateOnNewDocument`,
  `.waitForFunction`, `.addInitScript`, `.$eval` or `.$$eval` (Puppeteer, Playwright) is
  not reported: the function is serialised to the page, where imports do not exist. A
  function defined elsewhere and passed by reference, or a differently named helper that
  serialises its argument, is not recognised.
- **Syntactic.** `Promise` and `setTimeout` are matched by name; shadowed locals with
  those names are not distinguished.
- **No auto-fix by design.** The fix requires adding an `import { delay } from 'es-toolkit'`.
