# prefer-sum-by

Prefer [`sumBy`](https://es-toolkit.dev/reference/math/sumBy.html) from es-toolkit over a
property-summing `reduce`.

`items.reduce((acc, item) => acc + item.price, 0)` adds up one property of every item;
`sumBy(items, item => item.price)` says that directly.

## Rule details

This rule reports — it does **not** auto-fix — a `.reduce` seeded with the number `0` whose
reducer is a two-parameter arrow adding the accumulator and a direct property of the item.

### ❌ Incorrect

```js
items.reduce((acc, item) => acc + item.price, 0);
items.reduce((acc, item) => item.price + acc, 0);
items.reduce((acc, item) => acc + item.price, 0) / other.length; // not a mean
```

### ✅ Correct

```js
import { sumBy } from 'es-toolkit';

sumBy(items, item => item.price);

// Not a property sum — left untouched:
items.reduce((acc, item) => acc + item.price); // no seed: `acc` starts as the first item
items.reduce((acc, item) => acc + item.price, '0'); // a string seed concatenates
items.reduce((acc, item) => acc + item.a.b, 0); // a nested property
items.reduce((acc, item) => acc + item.price, 0) / items.length; // a mean — see `prefer-mean-by`
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **Arrow, expression body only.** A `function` callback or a block-body reducer is not
  matched.
- **One direct item property.** `item.price` and `item[key]` are matched; `item.a.b` or a
  computed value such as `item.price * item.qty` is not.
- **Numeric `0` seed required.** Without a seed the accumulator starts as the first item, an
  object, so the seedless form is not a property sum and is left alone.
- **The mean form is excluded.** `xs.reduce(…) / xs.length` is reported by
  [`prefer-mean-by`](prefer-mean-by.md), not here. The receiver and the `.length` object are
  compared as written, so `items.reduce(…) / other.length` is reported here.
- **No auto-fix by design.** The fix requires adding an `import { sumBy } from 'es-toolkit'`.
