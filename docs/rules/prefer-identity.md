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
- has exactly one parameter, a plain identifier without a TypeScript type annotation (a
  default value, rest parameter or destructuring is not allowed either),
- has no TypeScript type parameters and no return type annotation, and
- returns that parameter: the arrow's expression body is the parameter, or the body is a
  block holding a single `return x;`.

The returned value must be the bare identifier. A TypeScript cast or assertion
(`x as T`, `x!`, `<T>x`, `x satisfies T`) changes the result type, so it is not reported.

A function that is the sole argument of a `.filter(...)` call is skipped: `arr.filter(x => x)`
is a truthiness filter, which [`prefer-compact`](prefer-compact.md) owns. It stays skipped
even when `prefer-compact` is off or its `chainPosition` policy keeps it silent.

A function that is the sole argument of a `.map(...)` call is skipped too: `xs.map(x => x)`
copies or converts a collection, and the better rewrite drops the `map` (or uses `[...xs]` /
`Array.from(xs)`) instead of mapping with `identity`.

A typed or generic function (`(state: State) => state`, `<T>(x: T): T => x`) states a
signature: an exported API, or the input type of a selector that the generic `identity`
would lose. It is not reported.

### ❌ Incorrect

```js
groupBy(arr, x => x);
promise.then(value => value);
const id = x => x;
arr.map(function (x) {
  return x;
});
```

```ts
promise.catch(e => e); // `e` takes its type from context
```

### ✅ Correct

```js
import { identity } from 'es-toolkit';

groupBy(arr, identity);
promise.then(identity);
const id = identity;

// Not an identity function — left untouched:
arr.map(x => x.id);
arr.map((x, i) => x);
arr.map(async x => x);

// A truthiness filter — reported by prefer-compact instead:
arr.filter(x => x);

// A copy: drop the map, or write `[...arr]`, rather than `arr.map(identity)`:
arr.map(x => x);
```

```ts
// A cast changes the result type — left untouched:
fn((x: unknown) => x as string);

// A typed or generic signature — left untouched:
const selectState = (state: RootState) => state;
const id = <T>(x: T): T => x;
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
- **Typed functions are skipped wholesale.** A parameter annotation is skipped even where the
  type also comes from context (`.catch((e: unknown) => e)`), where `identity` would be
  fine. Without type information the two cases cannot be told apart.
- **Only `.map` copies are skipped.** `xs.flatMap(x => x)` (a flatten) and other callers are
  reported.
- No auto-fix is provided because adding the import is project-specific.
