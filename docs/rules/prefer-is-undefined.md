# prefer-is-undefined

Prefer [`isUndefined`](https://es-toolkit.dev/reference/predicate/isUndefined.html) from
es-toolkit over `value === undefined`.

## Rule details

This rule reports — it does **not** auto-fix — a check for `undefined` written by hand:

- a strict comparison (`===` or `!==`) with `undefined` or `void 0`, in either operand order;
- a `typeof value` comparison with `'undefined'`, using any of `===`, `==`, `!==` or `!=`, in
  either operand order (`typeof` always yields a string, so loose and strict are equivalent).

A negated check is replaced by `!isUndefined(value)`.

Loose `value == undefined` also matches `null`, so it is left to
[`prefer-is-nil`](./prefer-is-nil.md). A comparison that is one half of a combined
`null`/`undefined` check (`value === null || value === undefined`) is left to
[`prefer-is-nil`](./prefer-is-nil.md) / [`prefer-is-not-nil`](./prefer-is-not-nil.md), so the
pair is reported once. A `.filter(x => x !== undefined)` predicate is reported:
TypeScript infers the same type predicate from `x => !isUndefined(x)`.

### ❌ Incorrect

```js
value === undefined;
undefined !== value;
value === void 0;
typeof value === 'undefined';
typeof value != 'undefined';
```

### ✅ Correct

```js
import { isUndefined } from 'es-toolkit';

isUndefined(value);
!isUndefined(value);

// Left untouched:
value == undefined; // prefer-is-nil
value === null || value === undefined; // prefer-is-nil
value === 'undefined'; // a string, not the undefined value
```

### Not reported

```ts
// Feature detection: `isUndefined(window)` would throw where `window` is missing.
typeof window === 'undefined';
// `??`, `??=` and `?.` express these.
value !== undefined ? value : fallback;
if (options.size === undefined) options.size = 10;
next === undefined ? undefined : next.field;
// Part of an object probe, or one of several types.
typeof value === 'function' || value === undefined;
typeof value === 'undefined' || typeof value === 'string';
```

## Limitations

- **Syntactic match.** `undefined` is matched by name, so a shadowed local `undefined`
  binding could produce a false positive. Only `void 0` is recognized among `void`
  expressions.
- **Adjacent pairs only.** A pair is recognized when its halves sit next to each other in a
  `||` / `&&` chain; `value === null || ready || value === undefined` still reports the
  `undefined` half here.
- **Undeclared globals.** A bare `typeof x` operand is treated as declared only when the code
  declares it (variable, function, class, import or parameter). Built-in and configured
  globals, `/* global */` comments, `declare global` members and ambient `declare` statements
  may be missing at runtime, so their `typeof` checks are left alone. A member operand such as
  `typeof window.foo` is still reported: it throws on an undeclared `window` either way.
- **Native shorthands.** `x === undefined ? d : x` (`??`), `if (x === undefined) x = d`
  (`??=`) and `x === undefined ? undefined : x.y` (`?.`) are not reported: the operator is the
  better rewrite. `x === undefined ? 0 : x.length` is still reported.
- **Object probes.** A check that sits in one condition with `typeof x === 'object'`,
  `typeof x === 'function'` or `'key' in x` on the same expression is part of an
  `isObjectLike`-style probe and is not reported.
- **Type dispatch.** A `typeof` check is not reported when its condition (the `&&` / `||` /
  `!` tree it sits in, or a chain of ternaries) tests the same expression against another
  `typeof` type or `instanceof` constructor. Separate `if` / `else if` statements are separate
  conditions and are still reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isUndefined` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isUndefined` from `es-toolkit` does
  not count.
- **Narrowing needs types (TypeScript).** The guard narrows only its argument:
  `isUndefined(shape.kind)` does not narrow a discriminated union `shape`, and neither do
  destructured discriminants or a condition stored in a variable. A negated guard does not
  narrow a generic `T` / `T[K]` operand either, where `!==` does. The rule has no type
  information to tell; keep the comparison there.
- **No auto-fix by design.** The fix requires adding an
  `import { isUndefined } from 'es-toolkit'`.
