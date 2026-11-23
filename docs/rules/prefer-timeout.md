# prefer-timeout

Prefer [`timeout`](https://es-toolkit.dev/reference/promise/timeout.html) from es-toolkit
over a `new Promise` that only rejects from a `setTimeout`.

`timeout(ms)` returns a `Promise<never>` that rejects with a `TimeoutError` after `ms`
milliseconds — the hand-rolled `new Promise((_, reject) => setTimeout(reject, ms))`, with a
proper error instead of `undefined` and an optional `AbortSignal` that cancels the timer.

## Rule details

This rule reports — it does **not** auto-fix — a `new Promise` whose executor:

- is an arrow function or a function expression with two plain parameters
  (`resolve, reject`), and never uses `resolve`;
- consists of one `setTimeout(callback, ms)` call, as an expression body or a
  single-statement block body;
- passes a `callback` that only rejects: `reject` itself (`setTimeout(reject, ms)`), or a
  parameterless arrow or function that calls `reject` once (`() => reject(err)`,
  `() => { reject(err); }`, `function () { reject(err); }`);
- rejects with nothing, or with a value that says it timed out: a `'timeout'` string, a
  `new Error('Request timed out')` (string or template literal), a `new TimeoutError()`.

A promise that is one of the two entries of a `Promise.race([...])` is left to
[`prefer-with-timeout`](prefer-with-timeout.md).

### ❌ Incorrect

```js
new Promise((_, reject) => setTimeout(reject, 1000));
new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Request timed out')), ms),
);
new Promise((resolve, reject) => {
  setTimeout(() => reject(new TimeoutError()), ms);
});
const expire = ms => new Promise((_, reject) => setTimeout(reject, ms));
```

### ✅ Correct

```js
import { timeout } from 'es-toolkit';

await timeout(1000);

// A failure simulated after a delay, not a timeout — left untouched:
new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Error fetching data')), 500),
);

// Does more than reject after `ms`:
new Promise((resolve, reject) => {
  setTimeout(reject, ms);
  emitter.once('done', resolve);
});
new Promise((_, reject) => {
  timer = setTimeout(reject, ms); // the timer is kept for `clearTimeout`
});

// Raced against the work it limits — reported by prefer-with-timeout:
Promise.race([fetchData(), new Promise((_, reject) => setTimeout(reject, ms))]);

// Serialised and run in the browser page, where an imported `timeout` is not defined:
await page.evaluate(() => new Promise((_, reject) => setTimeout(reject, 100)));
```

## Limitations

- **The rejection value changes.** `timeout` rejects with es-toolkit's `TimeoutError`
  (message `The operation was timed out`). Code that rejected with `undefined` or with its
  own timeout error and then inspects it (`err === undefined`, `err.message`, a custom
  class) has to be adjusted.
- **Timeout wording is a text heuristic.** A rejection value counts as a timeout when the
  identifier, the constructor name or a string or template-literal argument contains
  "timeout", "time out", "timed out" or "time-out". Any other value (`new Error('Failed')`,
  `reject(error)`) is treated as a simulated failure and not reported, since `timeout`
  would replace it.
- **Single-statement executors only.** An executor that also stores the timer id
  (`const id = setTimeout(…)`, `timer = setTimeout(…)`) or does other work is not
  reported.
- **Inline promises only in races.** `const t = new Promise(…); Promise.race([p, t])` is
  reported here, on the `new Promise`; prefer-with-timeout only sees promises written
  inside the `Promise.race` array.
- **Browser-evaluated callbacks are recognised by method name**, as in
  [`prefer-delay`](prefer-delay.md): code inside a function passed directly to
  `.evaluate`, `.evaluateHandle`, `.evaluateOnNewDocument`, `.waitForFunction`,
  `.addInitScript`, `.$eval` or `.$$eval` is not reported. A script injected into a page by
  other means (read from disk and evaluated as a string) is not recognised.
- **Syntactic.** `Promise` and `setTimeout` are matched by name; shadowed locals with those
  names are not distinguished.
- **No auto-fix by design.** The fix requires adding an `import { timeout } from 'es-toolkit'`.
