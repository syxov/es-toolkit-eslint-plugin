# prefer-pick-by

Prefer [`pickBy`](https://es-toolkit.dev/reference/object/pickBy.html) — or
[`pick`](https://es-toolkit.dev/reference/object/pick.html) for a fixed set of keys — from
es-toolkit over `Object.fromEntries(Object.entries(o).filter(([k, v]) => pred))`.

Filtering an object through an intermediate array of entries spells out the mechanics.
`pickBy(o, (v, k) => pred)` names the intent, and `pick(o, keys)` states the kept keys
directly.

## Rule details

This rule reports — it does **not** auto-fix — an `Object.fromEntries` call whose only
argument is directly a one-argument `.filter(callback)` call on `Object.entries(o)` (with
exactly one argument), where the callback:

- has exactly one parameter, an array pattern of one or two plain identifiers or holes:
  `[k, v]`, `[k]` or `[, v]` (a type annotation on the pattern is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns a predicate that reads the key or the value parameter.

The rule has two messages:

- **`pick`** when the predicate only tests the key against a list that does not depend on
  the entry: `keys.includes(k)`, `set.has(k)`, `k === 'a'`, or an `||` chain of such tests
  (`k === 'a' || k === 'b'`).
- **`pickBy`** for any other predicate.

Negated predicates belong to [`prefer-omit-by`](prefer-omit-by.md): `!pred`, a conjunction
of negations (`!a && !b`), and key exclusions such as `!keys.includes(k)` or
`k !== 'a' && k !== 'b'`. A double negation (`!!v`) is a truthiness test and stays here.

A predicate that is a single nil check, as reported by `prefer-is-nil`, `prefer-is-not-nil`,
`prefer-is-null` or `prefer-is-undefined` (`v != null`, `v !== undefined`,
`typeof v !== 'undefined'`, `v !== null && v !== undefined`, also negated), is left to that
rule, so each snippet gets one report. Once the check reads `isNotNil(v)`, this rule reports
the frame (`pickBy(o, isNotNil)`). A compound predicate such as `v != null && k !== 'x'` is
reported by both: the nil rule on the comparison, this rule on the frame.

This rule does not use the `chainPosition` setting of the array-method rules: it replaces
the whole `Object.fromEntries(Object.entries(o).filter(…))` frame, never a member of a
method chain.

### ❌ Incorrect

```ts
const defined = Object.fromEntries(
  Object.entries(props).filter(([, v]) => isNotNil(v)),
);
Object.fromEntries(
  Object.entries(o).filter(([k, v]) => k.startsWith('_') && v),
);
const subset = Object.fromEntries(
  Object.entries(o).filter(([k]) => keys.includes(k)),
); // pick
Object.fromEntries(Object.entries(o).filter(([k]) => k === 'a' || k === 'b')); // pick
```

### ✅ Correct

```ts
import { isNotNil, pick, pickBy } from 'es-toolkit';

const defined = pickBy(props, isNotNil);
pickBy(o, (v, k) => k.startsWith('_') && v);
const subset = pick(o, keys);
pick(o, ['a', 'b']);

// Not reported:
Object.fromEntries(Object.entries(o).filter(([, v]) => !v)); // prefer-omit-by
Object.fromEntries(Object.entries(o).filter(([, v]) => v != null)); // prefer-is-not-nil first
Object.fromEntries(Object.entries(o).filter(isWanted)); // the callback is not inline
Object.fromEntries(Object.entries(o).filter(([k, v], i) => i > 0)); // the index is used
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. Computed access such as `Object['fromEntries']`
  is not reported.
- **Destructured callback only.** `e => e[1]` is not detected, nor is a callback with more
  than one statement.
- **`pick` without types.** `keys.includes(k)` is taken as a key list unless the receiver is
  a string literal or template: a string variable (`name.includes(k)` testing substrings)
  is still reported as `pick`. `pick` also copies only keys that exist on the object, like
  the original.
- **Truthy predicates.** `pickBy` is typed to take a boolean predicate; a predicate that
  returns a truthy value (`([, v]) => v`) may need `Boolean(v)` in TypeScript.
- **Direct nesting only.** `Object.entries(o).filter(…)` must be the direct argument of
  `Object.fromEntries`.
- **No auto-fix by design.** The fix requires an import and a callback rewritten to
  `(value, key)`, so the rule only reports.
