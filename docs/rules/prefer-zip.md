# prefer-zip

Prefer [`zip`](https://es-toolkit.dev/reference/array/zip.html) from es-toolkit over
`a.map((x, i) => [x, b[i]])`.

Pairing up the elements of several arrays by walking one of them and indexing the others
hides the intent behind index bookkeeping. `zip(a, b)` names the operation and treats every
input the same way.

## Rule details

This rule reports — it does **not** auto-fix — a one-argument `.map(callback)` call, where
the callback:

- has exactly two parameters `(x, i)`, both plain identifiers (type annotations are allowed);
- is an expression-bodied arrow, or an arrow or function expression whose body is a single
  `return`;
- returns an array literal of at least two elements, with no spread and no holes;
- puts the current element first, either as the bare `x` or as `a[i]` on the array being
  mapped;
- reads every other element as `<expr>[i]`, indexed by the bare `i`, where `<expr>` reads
  neither callback parameter.

The pattern is also reported when it feeds `Object.fromEntries`, as in
`Object.fromEntries(keys.map((k, i) => [k, values[i]]))`: `Object.fromEntries(zip(keys, values))`
says the same thing.

### ❌ Incorrect

```ts
const pairs = names.map((name, i) => [name, ages[i]]);
const rows = xs.map((x, i) => [x, ys[i], zs[i]]);
const same = a.map((_, i) => [a[i], b[i]]);
const lookup = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
const typed: Array<[string, number]> = names.map(function (
  name: string,
  i: number,
) {
  return [name, ages[i]];
});
```

### ✅ Correct

```ts
import { zip } from 'es-toolkit';

const pairs = zip(names, ages);
const rows = zip(xs, ys, zs);

// Not a zip — left untouched:
a.map((x, i) => [x, b[i + 1]]); // not the same index
a.map((x, i) => [x, i]); // pairs with the index itself
a.map((x, i) => [b[i], x]); // the mapped element is not first
a.map((x, i) => [x, b[i]], thisArg); // `thisArg` has no zip equivalent
a.map((x, i) => {
  log(i);
  return [x, b[i]];
}); // the callback does more than build the tuple
a.map((x, i) => ({ x, y: b[i] })); // an object, not a tuple
```

## Limitations

- **Length semantics differ.** `zip` pads to the longest input with `undefined`, while
  `a.map(...)` runs exactly `a.length` times. When another array is longer than `a`, `zip`
  returns extra tuples that the `map` did not; use `zip(a, b).slice(0, a.length)` or keep the
  `map` if that truncation is intended.
- **Receiver identity is textual.** `a[i]` counts as the current element when `a` has the
  same source text as the `.map` receiver (type-only wrappers like `as` and `!` are ignored).
  A receiver with side effects, such as `getItems().map((_, i) => [getItems()[i], b[i]])`,
  is still reported.
- **Syntactic match.** `.map` is matched by name on any receiver, so a non-array object with
  its own `map` method could produce a false positive. Computed access such as `a['map']`
  is not reported.
- **Inline callbacks only.** A callback passed by reference, such as `a.map(toPair)`, is not
  reported.
- **No auto-fix by design.** The fix requires adding an `import { zip } from 'es-toolkit'`
  and rewriting the call, so the rule only reports.
