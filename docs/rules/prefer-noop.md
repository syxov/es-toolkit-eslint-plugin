# prefer-noop

Prefer [`noop`](https://es-toolkit.dev/reference/function/noop.html) over an inline function
that does nothing, such as `() => {}`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-noop': 'error'`.

It is opt-in because `() => {}` is short and a deliberate empty handler is common, so
swapping it for an import is a style choice rather than a readability win.

This rule reports — it does **not** auto-fix — an arrow function or function expression
that:

- is neither `async` nor a generator,
- has an empty block body (`{}`; a comment inside does not matter), and
- has only plain identifier parameters or a rest parameter of a plain identifier (TypeScript
  type annotations, optional parameters and type parameters are allowed; a default value or
  destructuring is not).

An empty-bodied `async () => {}` is not reported: it returns a Promise, while `noop` returns
`undefined`. Generators return an iterator, so they are not reported either.

### ❌ Incorrect

```js
promise.catch(() => {});
el.addEventListener('click', function () {});
const handler = (_err, ...args) => {};
function run(cb = () => {}) {}
```

```ts
const onError = (e: Error) => {};
```

### ✅ Correct

```js
import { noop } from 'es-toolkit';

promise.catch(noop);
el.addEventListener('click', noop);
const handler = noop;
function run(cb = noop) {}

// Not an empty synchronous function — left untouched:
const log = () => {
  console.log('done');
};
const ready = async () => {};
const fallback = () => undefined;
```

## Limitations

- The rule matches the syntax only. It does not check whether `noop` is already in scope or
  shadowed.
- **Arity.** `noop.length` is `0`. Code that inspects a callback's `length` sees a different
  value after the rewrite: an Express error handler `(err, req, res, next) => {}` stops being
  treated as one, and a test callback declared with `done` changes meaning.
- **Shared identity.** Every `noop` is the same function. Registering it twice with
  `addEventListener` adds a single listener, `removeEventListener(type, noop)` removes it
  wherever it was added, and properties assigned to it are shared.
- **TypeScript signatures.** A parameter annotation can be the only place a variable's type
  is declared: after `const f = (value: string) => {}` becomes `const f = noop`, calling
  `f('x')` no longer type-checks. Annotate the variable instead. A function with only a
  TypeScript `this` parameter (`function (this: T) {}`) is reported.
- **Comments.** `() => { /* ignore */ }` is reported; move the comment next to `noop`.
- **Named function expressions** (`function onClick() {}`) are reported. The name only shows
  up in stack traces, so it is dropped by the rewrite.
- **Not reported:** function declarations (`function f() {}`), class and object methods,
  constructors, getters and setters, TypeScript signatures without a body, functions with a
  default or destructured parameter, and blocks that hold anything (a `'use strict'`
  directive, an empty statement `;`, a bare `return;`).
- No auto-fix is provided because adding the import is project-specific.
