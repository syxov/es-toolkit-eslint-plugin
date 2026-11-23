# prefer-is-not-nil

Prefer [`isNotNil`](https://es-toolkit.dev/reference/predicate/isNotNil.html) from es-toolkit
over `value != null` or `value !== null && value !== undefined`.

`isNotNil(value)` states the intent of the loose comparison explicitly, replaces the
two-comparison form with one call, and works as a type guard in `array.filter(isNotNil)`.

## Rule details

This rule reports — it does **not** auto-fix:

- a loose comparison `!=` with `null`, `undefined` or `void 0`, in either operand order;
- a `&&` of a strict `!== null` check and a strict `!== undefined` check on the same
  expression, in any operand order and with either comparison first.
  `typeof value !== 'undefined'` counts as the `undefined` half. The pair may sit anywhere in
  a longer `&&` chain as long as its halves are adjacent; only the pair is highlighted.

The halves of a reported pair are not reported again by
[`prefer-is-null`](./prefer-is-null.md) or [`prefer-is-undefined`](./prefer-is-undefined.md).

### ❌ Incorrect

```js
value != null;
undefined != value;
value !== null && value !== undefined;
value !== undefined && null !== value;
value !== null && typeof value !== 'undefined';
items.filter(x => x !== null && x !== undefined);
```

### ✅ Correct

```js
import { isNotNil } from 'es-toolkit';

isNotNil(value);
items.filter(isNotNil);

// Left untouched:
value !== null; // prefer-is-null
value !== null && other !== undefined; // different expressions
value != 'null'; // a string, not the null literal
```

### Not reported

```ts
// An object probe: on `unknown`, `isNotNil` would not narrow for the probe that follows.
value != null && typeof value === 'object' && 'fill' in value;
value !== null && value !== undefined && typeof value === 'object';
// `??` and `?.` express these.
value != null ? value : fallback;
value != null ? value.name : undefined;
// An assignment in the test.
while ((node = node.parent) != null) {}
```

## Limitations

- **Adjacent pairs only.** `value !== null && ready && value !== undefined` is not reported as
  a pair.
- **Syntactic identity.** The two halves must check the same source text: `obj.a` and
  `obj['a']` are treated as different expressions.
- **Syntactic match.** `undefined` is matched by name, so a shadowed local `undefined`
  binding could produce a false positive.
- **Native shorthands.** `x != null ? x : d` (`??`) and `x != null ? x.y : undefined` (`?.`)
  are not reported: the operator is the better rewrite. `x != null ? x.length : 0` is still reported.
- **Object probes.** A check that sits in one condition with `typeof x === 'object'`,
  `typeof x === 'function'` or `'key' in x` on the same expression is part of an
  `isObjectLike`-style probe and is not reported.
- **Assignment operand.** `(match = re.exec(s)) !== null` is not reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isNotNil` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isNotNil` from `es-toolkit` does
  not count.
- **`unknown` operands (TypeScript).** `isNotNil<T>(x: T | null | undefined): x is T` infers
  `T = unknown` from an `unknown` or `any` argument and narrows nothing, while `x != null`
  narrows `unknown` to `{}`. The object-probe shape is skipped; other `unknown` operands
  cannot be told apart without types.
- **Narrowing needs types (TypeScript).** The guard narrows only its argument:
  `isNotNil(shape.kind)` does not narrow a discriminated union `shape`, and neither do
  destructured discriminants or a condition stored in a variable. A negated guard does not
  narrow a generic `T` / `T[K]` operand either, where `!==` does. The rule has no type
  information to tell; keep the comparison there.
- **No auto-fix by design.** The fix requires adding an `import { isNotNil } from 'es-toolkit'`.
