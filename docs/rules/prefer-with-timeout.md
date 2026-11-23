# prefer-with-timeout

Prefer [`withTimeout`](https://es-toolkit.dev/reference/promise/withTimeout.html) from
es-toolkit over racing a promise against a timer that rejects.

`withTimeout(run, ms)` awaits `run()` and rejects with a `TimeoutError` when it does not
settle within `ms` milliseconds — the hand-rolled
`Promise.race([run(), new Promise((_, reject) => setTimeout(reject, ms))])`. Since
es-toolkit 1.53.1 it also clears its timer once `run()` settles, which the hand-rolled race
never does (in Node the pending timer keeps the process alive until it fires).

## Rule details

This rule reports — it does **not** auto-fix — a `Promise.race([a, b])` call with exactly
two entries, neither a spread nor a hole, where exactly one entry, in either order, is:

- a `new Promise` that only rejects from a `setTimeout`, the shape
  [`prefer-timeout`](prefer-timeout.md) describes (`(_, reject) => setTimeout(reject, ms)`,
  `() => reject(err)` callbacks, block bodies, `function` executors). Inside a race the
  rejection value may be anything: the race makes it a timeout;
- or a call to es-toolkit's own `timeout(ms)` / `timeout(ms, { signal })`, imported from
  `es-toolkit` or `es-toolkit/promise` under any local name.

### ❌ Incorrect

```js
await Promise.race([
  fetchData(),
  new Promise((_, reject) => setTimeout(reject, 1000)),
]);

await Promise.race([
  live.close(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('close timeout')), 5000),
  ),
]);

import { timeout } from 'es-toolkit';
await Promise.race([fetchData(), timeout(1000)]);
```

### ✅ Correct

```js
import { withTimeout } from 'es-toolkit';

await withTimeout(fetchData, 1000);
await withTimeout(() => live.close(), 5000);

// A soft deadline that resolves instead of rejecting — prefer-delay's business:
await Promise.race([
  collectCoverage(),
  new Promise(resolve => setTimeout(resolve, ms)),
]);

// A local `timeout` helper, which is often a sleep:
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
await Promise.race([fetchData(), timeout(1000)]);

// More than two entries:
await Promise.race([a, b, new Promise((_, reject) => setTimeout(reject, ms))]);
```

## Limitations

- **The rejection value changes.** `withTimeout` rejects with es-toolkit's `TimeoutError`
  (message `The operation was timed out`). A custom error such as
  ``new Error(`Test timed out (${name}).`)`` loses its message and any extra detail; code that
  inspects the error (`err.message`, a custom class) has to be adjusted, or keep a
  `catch` that rethrows its own error.
- **`run` is a function.** `Promise.race([p, …])` becomes `withTimeout(() => p, ms)` when
  `p` is a promise that already exists.
- **Inline entries only.** A timer promise stored in a variable first
  (`const t = new Promise(…); Promise.race([p, t])`) is not followed; prefer-timeout
  reports the `new Promise` instead.
- **Timers kept for `clearTimeout` are not matched.** An executor that stores the timer id
  (`timer = setTimeout(…)`) to clear it later is not the bare shape and is not reported,
  although `withTimeout` (1.53.1 and later) clears its timer too.
- **Namespace imports are not followed.** `esToolkit.timeout(ms)` inside a race is not
  recognised; only a named import of `timeout` is.
- **Browser-evaluated callbacks are recognised by method name**, as in
  [`prefer-delay`](prefer-delay.md). A script injected into a page by other means (read
  from disk and evaluated as a string) is not recognised.
- **Syntactic.** `Promise`, `setTimeout` and `race` are matched by name; shadowed locals
  with those names are not distinguished.
- **No auto-fix by design.** The fix requires adding an
  `import { withTimeout } from 'es-toolkit'`.
