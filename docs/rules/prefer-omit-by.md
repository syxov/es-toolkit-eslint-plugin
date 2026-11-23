# prefer-omit-by

Prefer [`omitBy`](https://es-toolkit.dev/reference/object/omitBy.html) — or
[`omit`](https://es-toolkit.dev/reference/object/omit.html) for a fixed set of keys — from
es-toolkit over `Object.fromEntries(Object.entries(o).filter(([k, v]) => !pred))`.

Dropping entries through an intermediate array with a negated filter spells out the
mechanics twice over. `omitBy(o, (v, k) => pred)` names the intent without the negation, and
`omit(o, keys)` states the dropped keys directly.

## Rule details

This rule reports — it does **not** auto-fix — an `Object.fromEntries` call whose only
argument is directly a one-argument `.filter(callback)` call on `Object.entries(o)` (with
exactly one argument), where the callback:

- has exactly one parameter, an array pattern of one or two plain identifiers or holes:
  `[k, v]`, `[k]` or `[, v]` (a type annotation on the pattern is allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns a negated predicate that reads the key or the value parameter.

The rule has two messages:

- **`omit`** when the predicate only excludes keys of a list that does not depend on the
  entry: `!keys.includes(k)`, `!set.has(k)`, `k !== 'a'`, an `&&` chain of such tests
  (`k !== 'a' && k !== 'b'`), or the negation of a key selection
  (`!(k === 'a' || k === 'b')`).
- **`omitBy`** for `!pred`, or a conjunction of negations (`!a && !b`, `k !== 'x' && !a`),
  which is `!(a || b)`.

Every other predicate, a double negation (`!!v`) and a partial negation
(`!keys.includes(k) && v`) included, belongs to [`prefer-pick-by`](prefer-pick-by.md), so
each frame is reported by exactly one of the two rules.

This rule does not use the `chainPosition` setting of the array-method rules: it replaces
the whole `Object.fromEntries(Object.entries(o).filter(…))` frame, never a member of a
method chain.

### ❌ Incorrect

```ts
Object.fromEntries(Object.entries(o).filter(([, v]) => !isNil(v)));
Object.fromEntries(Object.entries(hit).filter(([k]) => !k.startsWith('_')));
const rest = Object.fromEntries(
  Object.entries(props).filter(([k]) => !omitted.includes(k)),
); // omit
Object.fromEntries(
  Object.entries(row).filter(([k]) => k !== '__run' && k !== '__meta'),
); // omit
```

### ✅ Correct

```ts
import { omit, omitBy, isNil } from 'es-toolkit';

omitBy(o, isNil);
omitBy(hit, (v, k) => k.startsWith('_'));
const rest = omit(props, omitted);
omit(row, ['__run', '__meta']);

// Not reported here:
Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)); // prefer-pick-by
Object.fromEntries(
  Object.entries(o).filter(([k, v]) => !keys.includes(k) && v),
); // prefer-pick-by
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. Computed access such as `Object['fromEntries']`
  is not reported.
- **Destructured callback only.** `e => !e[1]` is not detected, nor is a callback with more
  than one statement.
- **`omit` without types.** `!keys.includes(k)` is taken as a key list unless the receiver
  is a string literal or template: a string variable is still reported as `omit`. A `Set`
  needs spreading (`omit(o, [...set])`).
- **Direct nesting only.** `Object.entries(o).filter(…)` must be the direct argument of
  `Object.fromEntries`.
- **No auto-fix by design.** The fix requires an import and an un-negated callback rewritten
  to `(value, key)`, so the rule only reports.
