# prefer-identity

Prefer [`identity`](https://es-toolkit.dev/reference/function/identity.html) over an inline
function that returns its argument unchanged, such as `x => x`.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-identity': 'error'`.

It is opt-in because an inline `x => x` is short and widely understood, so swapping it for
an import is a style choice rather than a readability win.

This rule reports — it does **not** auto-fix — an arrow function or function expression
that:

- is neither `async` nor a generator,
- has exactly one parameter, a plain identifier (a TypeScript type annotation and type
  parameters are allowed; a default value, rest parameter or destructuring is not), and
- returns that parameter: the arrow's expression body is the parameter, or the body is a
  block holding a single `return x;`.

The returned value must be the bare identifier. A TypeScript cast or assertion
(`x as T`, `x!`, `<T>x`, `x satisfies T`) changes the result type, so it is not reported.

A function that is the sole argument of a `.filter(...)` call is skipped: `arr.filter(x => x)`
is a truthiness filter, which [`prefer-compact`](prefer-compact.md) owns. It stays skipped
even when `prefer-compact` is off or its `chainPosition` policy keeps it silent.

### ❌ Incorrect

```js
arr.map(x => x);
groupBy(arr, x => x);
promise.then(value => value);
const id = x => x;
arr.map(function (x) {
  return x;
});
```

```ts
const id = <T>(x: T): T => x;
```

### ✅ Correct

```js
import { identity } from 'es-toolkit';

arr.map(identity);
groupBy(arr, identity);
promise.then(identity);
const id = identity;

// Not an identity function — left untouched:
arr.map(x => x.id);
arr.map((x, i) => x);
arr.map(async x => x);

// A truthiness filter — reported by prefer-compact instead:
arr.filter(x => x);
```

```ts
// A cast changes the result type — left untouched:
arr.map((x: unknown) => x as string);
```

## Limitations

- The rule matches the syntax only. It does not check whether `identity` is already in
  scope or shadowed.
- **Named function expressions** (`arr.map(function named(x) { return x; })`) are reported.
  The name only shows up in stack traces, so it is dropped by the rewrite.
- **Other truthiness predicates.** Only the sole `.filter` argument is skipped.
  `arr.some(x => x)`, `arr.find(x => x)` or `arr.filter(x => x, thisArg)` are reported, and
  `some(identity)` is the suggested rewrite.
- **Not reported:** function declarations (`function id(x) { return x; }`), class and object
  methods and setters (`{ id(x) { return x; } }`), functions with a TypeScript `this`
  parameter (`function (this: T, x) { return x; }`), and blocks that hold anything besides
  the `return` (a `'use strict'` directive, an empty statement, a log call).
- An optional parameter (`(x?: T) => x`) is a plain identifier and is reported.
- In TypeScript, `identity` is generic, so a callback whose parameter annotation widens or
  narrows the inferred type (`(x: number) => x`) may infer differently after the rewrite.
- No auto-fix is provided because adding the import is project-specific.
