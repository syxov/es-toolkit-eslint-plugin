# prefer-debounce

Prefer [`debounce`](https://es-toolkit.dev/reference/function/debounce.html) over a
hand-written debounce that clears a timer handle and re-arms it with `setTimeout`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-debounce': 'error'`.

It is opt-in because a hand-written timer is sometimes deliberate (custom cancel or flush
logic, or a handle shared with other code), and the detection is a heuristic on statement
order rather than a proof that the code is a debounce.

This rule reports — it does **not** auto-fix — an assignment `H = setTimeout(…)` when:

- it is its own expression statement (operator `=`, the right side is the `setTimeout` call
  itself), and
- an earlier statement in the same block (or at the top level of the file) clears the same
  handle `H`: `clearTimeout(H);`, `if (H) clearTimeout(H);` or `if (H) { clearTimeout(H); }`
  (the guard is the bare handle, the block holds only the call, and there is no `else`).
  Other statements may sit in between.

`clearTimeout` and `setTimeout` may each be called bare or as `window.…` / `globalThis.…`.
The handle is compared by its source text, so `this.timer` matches `this.timer` but not
`timer`. The rule reports once per assignment, however many clears precede it.

### ❌ Incorrect

```js
let timer;
function onInput() {
  clearTimeout(timer);
  timer = setTimeout(() => search(), 300);
}

input.addEventListener('input', () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(search, 300);
});
```

```ts
class Search {
  private timer?: number;
  onInput(query: string): void {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.search(query), 300);
  }
  search(query: string): void {}
}
```

### ✅ Correct

```js
import { debounce } from 'es-toolkit';

const onInput = debounce(() => search(), 300);
input.addEventListener('input', onInput);

// Not a clear followed by a re-arm of the same handle — left untouched:
clearTimeout(t);
t = null;

t = setTimeout(f, 100);
clearTimeout(t);

clearInterval(t);
t = setInterval(f, 100);
```

## Limitations

- **Sibling statements only.** The clear and the assignment must be statements of the same
  block or of the file's top level. A clear inside a nested `if (x) { … }`, an assignment in a
  `switch` case, a nested function or a `return (t = setTimeout(…))` is not reported.
- **Trailing-edge debounce only.** The rule recognises the plain "cancel, then schedule"
  shape. Leading-edge debounces, throttles and `setInterval` timers are not reported; use
  `debounce`'s `edges` option or `throttle` when rewriting such code by hand.
- **The rewrite moves the timer.** `debounce` returns a new function that owns the timer, so
  the debounced function must be created once, outside the handler, and called from it (or
  used as the handler). Code that reads or clears the handle elsewhere should switch to the
  debounced function's `cancel()`/`flush()` methods.
- **Syntactic names.** `clearTimeout`, `setTimeout`, `window` and `globalThis` are matched by
  name; a shadowed local binding is a false-positive risk. Timer functions on other objects
  (`timers.setTimeout`) are not reported.
- No auto-fix is provided because the rewrite restructures the surrounding code.
