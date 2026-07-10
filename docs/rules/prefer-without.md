# prefer-without

Prefer [`without`](https://es-toolkit.dev/reference/array/without.html) from es-toolkit
over `arr.filter(x => x !== value)`.

Removing specific values from an array is `without(arr, value)` — named, and it accepts
several values at once.

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.filter` whose
body is a `!==`/`!=` comparison between the parameter itself and some other value.

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
```

## Options

`skipTypePredicate` defaults to `false`, so the rule reports type-predicate callbacks just
like other filters. Set it to `true` to leave callbacks with a TypeScript predicate for their
filter parameter untouched:

```js
{
  rules: {
    'es-toolkit/prefer-without': ['error', { skipTypePredicate: true }],
  },
}
```

This preserves TypeScript narrowing from predicates such as
`(x): x is string => x !== value`, which `without` cannot represent in its return type.

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **Element comparison only.** Exactly one side of the comparison must be the predicate's
  own parameter, so `x => x.id !== value` is left alone.
- **Single value.** Multi-value chains (`x => x !== a && x !== b`) are not matched, even
  though `without(arr, a, b)` would cover them.
- **Optional type-predicate skipping.** With `skipTypePredicate: true`, callbacks whose
  return type is a TypeScript predicate for the filter parameter are left untouched because
  `without` cannot preserve their narrowing.
- **No auto-fix by design.** The fix requires adding an
  `import { without } from 'es-toolkit'`.
