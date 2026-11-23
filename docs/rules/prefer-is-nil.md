# prefer-is-nil

Prefer [`isNil`](https://es-toolkit.dev/reference/predicate/isNil.html) from es-toolkit over
`value == null` or `value === null || value === undefined`.

`isNil(value)` states the intent of the loose comparison explicitly and replaces the
two-comparison form with one call.

## Rule details

This rule reports — it does **not** auto-fix:

- a loose comparison `==` with `null`, `undefined` or `void 0`, in either operand order;
- a `||` of a strict `null` check and a strict `undefined` check on the same expression, in
  any operand order and with either comparison first. `typeof value === 'undefined'` counts
  as the `undefined` half. The pair may sit anywhere in a longer `||` chain as long as its
  halves are adjacent; only the pair is highlighted.

The halves of a reported pair are not reported again by
[`prefer-is-null`](./prefer-is-null.md) or [`prefer-is-undefined`](./prefer-is-undefined.md).

### ❌ Incorrect

```js
value == null;
undefined == value;
value === null || value === undefined;
undefined === value || value === null;
value === null || typeof value === 'undefined';
ready || value === null || value === undefined;
```

### ✅ Correct

```js
import { isNil } from 'es-toolkit';

isNil(value);
ready || isNil(value);

// Left untouched:
value === null; // prefer-is-null
value === null || other === undefined; // different expressions
value == 'null'; // a string, not the null literal
```

### Not reported

```ts
// An object probe, not a nil check of its own.
value == null || typeof value !== 'object';
// `??`, `??=` and `?.` express these.
value == null ? fallback : value;
if (options.cache == null) options.cache = new Map();
value === null || value === undefined ? fallback : value;
value == null ? undefined : value.name;
// Feature detection: `isNil(window)` would throw where `window` is missing.
typeof window === 'undefined' || window === null;
```

## Limitations

- **Adjacent pairs only.** `value === null || ready || value === undefined` is not reported as
  a pair.
- **Syntactic identity.** The two halves must check the same source text: `obj.a` and
  `obj['a']` are treated as different expressions.
- **Syntactic match.** `undefined` is matched by name, so a shadowed local `undefined`
  binding could produce a false positive.
- **Native shorthands.** `x == null ? d : x` (`??`), `if (x == null) x = d`
  (`??=`) and `x == null ? undefined : x.y` (`?.`) are not reported: the operator is the
  better rewrite. `x == null ? 0 : x.length` is still reported.
- **Object probes.** A check that sits in one condition with `typeof x === 'object'`,
  `typeof x === 'function'` or `'key' in x` on the same expression is part of an
  `isObjectLike`-style probe and is not reported.
- **Assignment operand.** `(match = re.exec(s)) !== null` is not reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isNil` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isNil` from `es-toolkit` does
  not count.
- **Narrowing needs types (TypeScript).** The guard narrows only its argument:
  `isNil(shape.kind)` does not narrow a discriminated union `shape`, and neither do
  destructured discriminants or a condition stored in a variable. A negated guard does not
  narrow a generic `T` / `T[K]` operand either, where `!==` does. The rule has no type
  information to tell; keep the comparison there.
- **No auto-fix by design.** The fix requires adding an `import { isNil } from 'es-toolkit'`.
