# prefer-is-promise

Prefer [`isPromise`](https://es-toolkit.dev/reference/predicate/isPromise.html) from
es-toolkit over `value instanceof Promise`.

## Rule details

This rule reports — it does **not** auto-fix — an `instanceof` check whose right operand is
the global `Promise` identifier. A negated check `!(value instanceof Promise)` is replaced by
`!isPromise(value)`.

`isPromise` is `value instanceof Promise` and narrows the value to `Promise<any>` in
TypeScript.

### ❌ Incorrect

```js
value instanceof Promise;
!(value instanceof Promise);
```

### ✅ Correct

```js
import { isPromise } from 'es-toolkit';

isPromise(value);
!isPromise(value);

// Not a plain `Promise` check — left untouched:
value instanceof PromiseLike;
value instanceof window.Promise;
typeof value?.then === 'function'; // a thenable check, see Limitations
```

### Not reported

```ts
// One value tested against several types.
value instanceof Promise || value instanceof Error;
// A test assertion.
expect(value instanceof Promise).toBe(true);
// The code already has its own `isPromise`.
const isPromise = (value: unknown) => value instanceof Promise;
```

## Limitations

- **Thenables are not promises.** Duck-typed checks such as `typeof value?.then ===
'function'` accept any object with a `then` method (promises from another realm, jQuery
  deferreds, custom thenables). `isPromise` does not, so they are never reported.
- **Syntactic match.** `Promise` is matched by name, so a shadowed local `Promise` binding
  (a polyfill such as `bluebird` imported as `Promise`) could produce a false positive.
- **Bare identifier only.** Qualified constructors such as `window.Promise` or
  `globalThis.Promise` are not reported.
- **Type dispatch.** A check is not reported when its condition (the `&&` / `||` / `!` tree
  it sits in, or a chain of ternaries) tests the same expression against another `typeof`
  type or `instanceof` constructor.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isPromise`, the
  check is not reported. An import of `isPromise` from `es-toolkit` does not count.
- **No auto-fix by design.** The fix requires adding an
  `import { isPromise } from 'es-toolkit'`.
