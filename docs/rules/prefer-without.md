# prefer-without

Prefer [`without`](https://es-toolkit.dev/reference/array/without.html) from es-toolkit
over `arr.filter(x => x !== value)`.

Removing specific values from an array is `without(arr, value)` — named, and it accepts
several values at once.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose
body is a `!==` comparison between the parameter itself and a value that does not depend on
the parameter. Loose `!=` comparisons are reported only with `checkLooseInequality: true`.

It does not report exclusions of `null`, `undefined`, `void 0` or `false`, callbacks with a
type predicate (by default), or optional calls (`xs?.filter(…)`); see below.

### ❌ Incorrect

```js
arr.filter(x => x !== value);
arr.filter(x => value !== x);
```

### ✅ Correct

```js
import { without } from 'es-toolkit';

without(arr, value);

// Not a `without` — left untouched:
arr.filter(x => x.id !== value); // compares a property, not the element
arr.filter(x => x === value); // keeps the value rather than removing it
arr.filter(x => x !== f(x)); // the compared value depends on the element
arr.filter(x => x != null); // loose `!=`, see `checkLooseInequality`
arr.filter(x => x !== null); // narrows `(T | null)[]` to `T[]` in TypeScript
arr.filter((x): x is Item => x !== value); // type predicate, see `skipTypePredicate`
state.hints?.filter(h => h !== hint); // optional call: `without(undefined, hint)` throws
```

### Excluding `null`, `undefined` or `false`

Since TypeScript 5.5, `xs.filter(x => x !== null)` infers the predicate `x is T` and returns
`T[]`. `without(xs, null)` instead returns `(T | null)[]`: its signature widens the element
type to include the excluded value. The same holds for `undefined`, `void 0` and `false`, so
these values are never reported, in JavaScript files too. The es-toolkit alternatives that
keep the narrowing are:

```ts
import { compact, isNotNil } from 'es-toolkit';

xs.filter(isNotNil); // drops both null and undefined
compact(xs); // drops every falsy value (false, null, undefined, 0, '', NaN)
```

## Options

### `checkLooseInequality`

`checkLooseInequality` defaults to `false`, so only strict `!==` is reported. Set it to `true`
to also report loose `!=` comparisons:

```js
{
  rules: {
    'es-toolkit/prefer-without': ['error', { checkLooseInequality: true }],
  },
}
```

It is opt-in because `!=` coerces: `arr.filter(x => x != null)` drops both `null` and
`undefined`, while `without(arr, null)` compares with SameValueZero and keeps `undefined`.
The same goes for other coercions (`'1' != 1` is `false`). Rewriting a loose comparison is
equivalent only when no element is loosely equal to the value without being the same value.
Even with the option on, `x != null` and `x != undefined` are left to
[`prefer-is-not-nil`](prefer-is-not-nil.md): they are nil checks, not a single excluded value.

### `skipTypePredicate`

`skipTypePredicate` defaults to `true`, so callbacks with a TypeScript predicate for their
filter parameter (`(x): x is string => x !== value`) are left untouched: `without` cannot
represent that narrowing in its return type. Set it to `false` to report them like other
filters:

```js
{
  rules: {
    'es-toolkit/prefer-without': ['error', { skipTypePredicate: false }],
  },
}
```

Even then, a predicate excluding `null`, `undefined` or `false` is not reported (see above).

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **Element comparison only.** Exactly one side of the comparison must be the predicate's
  own parameter, so `x => x.id !== value` is left alone.
- **The value must not depend on the element.** `x => x !== f(x)` or `x => x.next !== x`
  reads the parameter on the value side, so it is skipped.
- **Strict inequality by default.** `x => x != value` is reported only with
  `checkLooseInequality: true`, because `!=` coerces `null`/`undefined` and `without` does not.
- **Arrow predicates only.** A `function` callback (`arr.filter(function (x) { … })`) or a
  block-body arrow is not matched.
- **Single value.** Multi-value chains (`x => x !== a && x !== b`) are not matched, even
  though `without(arr, a, b)` would cover them.
- **Type predicates are skipped by default.** Callbacks whose return type is a TypeScript
  predicate for the filter parameter are left untouched unless `skipTypePredicate: false`.
- **Nil and `false` exclusions are never reported**, because `without` widens the result
  type instead of narrowing it. Use `filter(isNotNil)` or `compact` instead.
- **Inferred literal predicates are not detected.** TypeScript also infers a predicate for
  `views.filter(v => v !== 'meridiem')` on a literal-union array, and `without` loses it.
  Telling that apart from a `string[]` needs type information, so it is still reported.
- **Optional calls are skipped.** `xs?.filter(x => x !== v)` returns `undefined` for a nil
  `xs`, while `without(xs, v)` throws; a rewrite needs a guard.
- **No auto-fix by design.** The fix requires adding an
  `import { without } from 'es-toolkit'`.
