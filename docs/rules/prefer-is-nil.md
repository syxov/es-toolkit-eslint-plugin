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

## Limitations

- **Adjacent pairs only.** `value === null || ready || value === undefined` is not reported as
  a pair.
- **Syntactic identity.** The two halves must check the same source text: `obj.a` and
  `obj['a']` are treated as different expressions.
- **Syntactic match.** `undefined` is matched by name, so a shadowed local `undefined`
  binding could produce a false positive.
- **No auto-fix by design.** The fix requires adding an `import { isNil } from 'es-toolkit'`.
