# prefer-mean-by

Prefer [`meanBy`](https://es-toolkit.dev/reference/math/meanBy.html) from es-toolkit over a
property-summing `reduce` divided by the same array's length.

`items.reduce((acc, item) => acc + item.price, 0) / items.length` averages one property;
`meanBy(items, item => item.price)` says that directly.

## Rule details

This rule reports — it does **not** auto-fix — a division whose numerator is the
[`prefer-sum-by`](prefer-sum-by.md) shape (`xs.reduce((acc, item) => acc + item.prop, 0)`)
and whose denominator is the `.length` of the same receiver, `xs.length`.

### ❌ Incorrect

```js
items.reduce((acc, item) => acc + item.price, 0) / items.length;
this.items.reduce((acc, item) => item.price + acc, 0) / this.items.length;
```

### ✅ Correct

```js
import { meanBy } from 'es-toolkit';

meanBy(items, item => item.price);

// Not a property mean — left untouched:
items.reduce((acc, item) => acc + item.price, 0) / other.length; // another array — see `prefer-sum-by`
items.reduce((acc, item) => acc + item.price) / items.length; // no `0` seed
items.reduce((acc, item) => acc + item, 0) / items.length; // a plain mean — see `prefer-mean`
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.
See [Method-call chains](../method-call-chains.md).

Chain position is measured on the `reduce` call.

## Limitations

- **The numerator must be the exact property-sum shape.** Same constraints as
  [`prefer-sum-by`](prefer-sum-by.md): an expression-body arrow (not a `function` callback)
  adding the accumulator and one direct item property, seeded with the number `0`.
- **The receivers are compared as written.** `xs.reduce(…) / xs.length` and
  `this.items.reduce(…) / this.items.length` are reported; `items.reduce(…) / other.length`
  is left to `prefer-sum-by`. The comparison is textual apart from type-only wrappers
  (`as`, `!`, `satisfies`), so
  `items.filter(f).reduce(…) / items.length` is not treated as a mean.
- **No auto-fix by design.** The fix requires adding an `import { meanBy } from 'es-toolkit'`.
