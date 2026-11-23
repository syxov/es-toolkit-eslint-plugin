# prefer-difference-by

Prefer [`differenceBy`](https://es-toolkit.dev/reference/array/differenceBy.html) from
es-toolkit over `a.filter(x => !b.some(y => y.id === x.id))`.

Dropping the elements whose key also occurs in another array is `differenceBy(a, b, x => x.id)`:
the key is written once, and the lookup is a `Set` (`O(n + m)`) instead of a nested scan
(`O(n * m)`).

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose body
keeps the elements that match none of another array, where the inner callback compares the
same mapping of both elements with `===` (or `!==` in the `every` form):

- `!b.some(y => f(y) === f(x))`
- `b.every(y => f(y) !== f(x))` or `b.every(y => !(f(y) === f(x)))`
- `b.findIndex(y => f(y) === f(x)) === -1` (or `< 0`)

The mapping is any expression of the parameter that reads the same on both sides: `y.id`,
`y.a.b`, `y[key]`, `String(y)`, `y.name.toLowerCase()`. Either operand order is matched.

### ❌ Incorrect

```js
a.filter(x => !b.some(y => y.id === x.id));
remote.filter(file => !local.some(f => f.path === file.path));
a.filter(x => b.every(y => String(y) !== String(x)));
a.filter(x => b.findIndex(y => y.id === x.id) === -1);
```

### ✅ Correct

```js
import { differenceBy } from 'es-toolkit';

differenceBy(a, b, x => x.id);
differenceBy(remote, local, file => file.path);

// Not a `differenceBy` — left untouched:
a.filter(x => !b.some(y => y.id === x.userId)); // different keys: `differenceWith`
a.filter(x => !b.some(y => isEqual(x, y))); // comparator: `differenceWith`
a.filter(x => !b.some(y => y.id == x.id)); // loose equality: `differenceWith`
a.filter(x => !b.some(y => y === x)); // the elements themselves: `difference`
a.filter(x => b.some(y => y.id === x.id)); // keeps matches: an intersection
a.filter(x => !x.links.some(y => y.id === x.id)); // the second array depends on `x`
xs?.filter(x => !b.some(y => y.id === x.id)); // optional call
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.
See [Method-call chains](../method-call-chains.md).

## Limitations

- **One rule per snippet.** A comparison of two different keys, a comparator call, several
  `&&`-joined equalities or `==` belong to [`prefer-difference-with`](prefer-difference-with.md);
  this rule leaves them alone.
- **`SameValueZero`.** `differenceBy` looks keys up in a `Set`, so a `NaN` key matches another
  `NaN`, while `NaN === NaN` is false. Only `NaN` keys behave differently.
- **Plain element comparison is not reported.** `!b.some(y => y === x)` is `difference(a, b)`;
  neither this rule nor [`prefer-difference`](prefer-difference.md) reports it.
- **Arrow callbacks with an expression body only.** `function` callbacks, block bodies,
  destructured parameters and callbacks that read their index are not matched.
- **`!b.find(…)` is not matched**: it treats a falsy match (`0`, `''`) as no match.
- **The second array must not depend on the element** (`x.links.some(…)`), and optional calls
  (`xs?.filter`, `b?.some`) are skipped, since `differenceBy` would throw on a nil array.
- **Syntactic match.** The rule does not know the types: typed arrays declared in the file are
  skipped, but an array-like value from elsewhere is still reported.
- **No auto-fix by design.** The fix requires adding an
  `import { differenceBy } from 'es-toolkit'`.
