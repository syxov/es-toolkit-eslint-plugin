# prefer-is-null

Prefer [`isNull`](https://es-toolkit.dev/reference/predicate/isNull.html) from es-toolkit over
`value === null`.

## Rule details

This rule reports — it does **not** auto-fix — a strict comparison with the `null` literal,
`===` or `!==`, in either operand order. A negated check is replaced by `!isNull(value)`.

Loose `value == null` also matches `undefined`, so it is left to
[`prefer-is-nil`](./prefer-is-nil.md). A strict comparison that is one half of a combined
`null`/`undefined` check (`value === null || value === undefined`) is left to
[`prefer-is-nil`](./prefer-is-nil.md) / [`prefer-is-not-nil`](./prefer-is-not-nil.md), so the
pair is reported once. A `.filter(x => x !== null)` predicate is reported: TypeScript
infers the same type predicate from `x => !isNull(x)`.

### ❌ Incorrect

```js
value === null;
null === value;
value !== null;
```

### ✅ Correct

```js
import { isNull } from 'es-toolkit';

isNull(value);
!isNull(value);

// Left untouched:
value == null; // prefer-is-nil
value === null || value === undefined; // prefer-is-nil
value === 'null'; // a string, not the null literal
```

### Not reported

```ts
// An object probe (`isObjectLike`), not a null check of its own.
typeof value === 'object' && value !== null;
typeof options !== 'object' || options === null;
// `??`, `??=` and `?.` express these.
value === null ? fallback : value;
if (cache === null) cache = new Map();
value === null ? null : value.format();
// An assignment in the test.
while ((match = re.exec(text)) !== null) {}
```

## Limitations

- **Adjacent pairs only.** A pair is recognized when its halves sit next to each other in a
  `||` / `&&` chain; `value === null || ready || value === undefined` still reports the
  `null` half here.
- **Native shorthands.** `x === null ? d : x` (`??`), `if (x === null) x = d`
  (`??=`) and `x === null ? undefined : x.y` (`?.`) are not reported: the operator is the
  better rewrite. `x === null ? 0 : x.length` is still reported.
- **Object probes.** A check that sits in one condition with `typeof x === 'object'`,
  `typeof x === 'function'` or `'key' in x` on the same expression is part of an
  `isObjectLike`-style probe and is not reported.
- **Assignment operand.** `(match = re.exec(s)) !== null` is not reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported; a matcher
  states it better.
- **Own helper in scope.** When the code already sees a binding named `isNull` (a local
  flag, a project helper with other semantics, or a re-implementation), the check is not
  reported: the suggestion would clash with it. An import of `isNull` from `es-toolkit` does
  not count.
- **Narrowing needs types (TypeScript).** The guard narrows only its argument:
  `isNull(shape.error)` does not narrow a discriminated union `shape`, and neither do
  destructured discriminants or a condition stored in a variable. A negated guard does not
  narrow a generic `T` / `T[K]` operand either, where `!==` does. The rule has no type
  information to tell; keep the comparison there.
- **No auto-fix by design.** The fix requires adding an `import { isNull } from 'es-toolkit'`.
