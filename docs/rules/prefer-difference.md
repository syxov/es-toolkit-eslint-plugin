# prefer-difference

Prefer [`difference`](https://es-toolkit.dev/reference/array/difference.html) from
es-toolkit over `a.filter(x => !b.includes(x))`.

Filtering out the members of another array is `difference(a, b)` — clearer, and `O(n + m)`
instead of the `O(n * m)` of a `filter` + `includes` scan.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose
body is `!<other>.includes(<param>)`.

### ❌ Incorrect

```js
a.filter(x => !b.includes(x));
items.filter(item => !exclude.includes(item));
```

### ✅ Correct

```js
import { difference } from 'es-toolkit';

difference(a, b);

// Not a difference — left untouched:
a.filter(x => b.includes(x)); // that is `intersection`
a.filter(x => !b.includes(x.id)); // compares a property, not the element
a.filter(x => !x.children.includes(x)); // the receiver depends on the element
a.filter(x => !['{', '}'].includes(x)); // inline list of values: `without(a, '{', '}')` fits
words.filter(w => !getText().includes(w)); // a call result may be a string: substring test
xs?.filter(x => !b.includes(x)); // optional call: `difference(undefined, b)` throws
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.
See [Method-call chains](../method-call-chains.md).

## Limitations

- **Predicate is identity-checked.** Only `!b.includes(x)` where `x` is the predicate's
  own parameter is reported, so `!b.includes(x.id)` is left alone.
- **The receiver must not depend on the element.** `x => !x.children.includes(x)` or
  `x => !lookup[x].includes(x)` reads the parameter on the receiver side, so it is skipped.
- **Inline value lists are skipped.** `!['a', 'b'].includes(x)` excludes a few listed values,
  which reads better as [`without(xs, 'a', 'b')`](prefer-without.md) than as `difference`.
  Neither rule reports it.
- **String receivers.** A string or template literal receiver is skipped, and so is any call
  result other than `Array.from(…)`, `Object.keys(…)` and `Object.values(…)`, since it may
  return a string (`!getText().includes(w)` is a substring check). A string held in a
  variable (`words.filter(w => !text.includes(w))`) looks the same as an array and is still
  reported.
- **Optional calls are skipped.** `xs?.filter(x => !b.includes(x))` returns `undefined` for a
  nil `xs`, while `difference(xs, b)` throws; a rewrite needs a guard.
- **Arrow predicates only.** A `function` callback (`arr.filter(function (x) { … })`) or a
  block-body arrow is not matched.
- **`includes` only.** The `b.indexOf(x) === -1` / `b.indexOf(x) < 0` variants are not
  matched.
- **Syntactic match.** The rule does not verify `b` is an array; a `Set`/`Map` receiver
  named the same way would still report.
- **No auto-fix by design.** The fix requires adding an
  `import { difference } from 'es-toolkit'`.
