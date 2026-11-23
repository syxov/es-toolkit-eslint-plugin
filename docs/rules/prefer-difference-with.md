# prefer-difference-with

Prefer [`differenceWith`](https://es-toolkit.dev/reference/array/differenceWith.html) from
es-toolkit over `a.filter(x => !b.some(y => isEqual(x, y)))`.

Dropping the elements that equal one of another array, by a custom notion of equality, is
`differenceWith(a, b, isEqual)`: the intent ("a minus b") is in the name, and the comparator
stands on its own.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose body
keeps the elements that match none of another array:

- `!b.some(y => <equal>)`
- `b.every(y => !<equal>)` or `b.every(y => <left> !== <right>)`
- `b.findIndex(y => <equal>) === -1` (or `< 0`)

where `<equal>` compares the two elements:

- an equality between an expression of `x` and an expression of `y` that is not the same
  mapping on both sides (`y.id === x.userId`, `id === x.id`), or any `==` equality;
- a call taking both elements, `isEqual(x, y)` or `isEqual(y, x)`;
- an `equals`, `equal`, `isEqual` or `isSame` method of one element called with the other
  (`x.equals(y)`);
- several of these joined with `&&`.

The same mapping on both sides with `===` belongs to
[`prefer-difference-by`](prefer-difference-by.md).

### ❌ Incorrect

```js
a.filter(x => !b.some(y => isEqual(x, y)));
users.filter(user => !removed.some(r => r.userId === user.id));
rows.filter(row => !seen.some(s => s.id === row.id && s.type === row.type));
a.filter(x => b.every(y => !x.equals(y)));
```

### ✅ Correct

```js
import { differenceWith } from 'es-toolkit';

differenceWith(a, b, isEqual);
differenceWith(users, removed, (user, r) => r.userId === user.id);
differenceWith(rows, seen, (row, s) => s.id === row.id && s.type === row.type);

// Not a `differenceWith` — left untouched:
a.filter(x => !b.some(y => y.id === x.id)); // one key: `differenceBy`
a.filter(x => !b.some(y => y === x)); // the elements themselves: `difference`
names.filter(name => !prefixes.some(p => name.startsWith(p))); // not an equality
a.filter(x => !b.some(y => y.id === x.id || y.name === x.name)); // `||` of equalities
a.filter(x => !b.some(y => y.active && y.id === x.userId)); // also filters `b`
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.
See [Method-call chains](../method-call-chains.md).

## Limitations

- **Equality-shaped comparators only.** Matching by prefix, substring, range or a
  `||`-combined test (`name.startsWith(p)`, `y.id > x.id`) is not an equality, and reads
  oddly as one; such filters are left alone. A two-argument call is accepted whatever its
  name, since it already is a comparator (`differenceWith(a, b, matches)`).
- **Same complexity.** `differenceWith` still compares every pair (`O(n * m)`); the gain is
  readability, not speed.
- **Plain element comparison is not reported.** `!b.some(y => y === x)` is `difference(a, b)`.
- **Arrow callbacks with an expression body only.** `function` callbacks, block bodies,
  destructured parameters and callbacks that read their index are not matched.
- **`!b.find(…)` is not matched**: it treats a falsy match (`0`, `''`) as no match.
- **The second array must not depend on the element**, and optional calls (`xs?.filter`,
  `b?.some`) are skipped, since `differenceWith` would throw on a nil array.
- **No auto-fix by design.** The fix requires adding an
  `import { differenceWith } from 'es-toolkit'`.
