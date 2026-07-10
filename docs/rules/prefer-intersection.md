# prefer-intersection

Prefer [`intersection`](https://es-toolkit.dev/reference/array/intersection.html) from
es-toolkit over `a.filter(x => b.includes(x))`.

Keeping only the members shared with another array is `intersection(a, b)` — clearer, and
`O(n + m)` instead of the `O(n * m)` of a `filter` + `includes` scan.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose
body is `<other>.includes(<param>)`.

### ❌ Incorrect

```js
a.filter(x => b.includes(x));
items.filter(item => allowed.includes(item));
```

### ✅ Correct

```js
import { intersection } from 'es-toolkit';

intersection(a, b);

// Not an intersection — left untouched:
a.filter(x => !b.includes(x)); // that is `difference`
a.filter(x => b.includes(x.id)); // compares a property, not the element
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **Predicate is identity-checked.** Only `b.includes(x)` where `x` is the predicate's own
  parameter is reported, so `b.includes(x.id)` is left alone.
- **`includes` only.** The `b.indexOf(x) !== -1` / `b.indexOf(x) >= 0` variants are not
  matched.
- **Syntactic match.** The rule does not verify `b` is an array; a `Set`/`Map` receiver
  named the same way would still report.
- **No auto-fix by design.** The fix requires adding an
  `import { intersection } from 'es-toolkit'`.
