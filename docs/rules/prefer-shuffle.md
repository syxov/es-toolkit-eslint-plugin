# prefer-shuffle

Prefer [`shuffle`](https://es-toolkit.dev/reference/array/shuffle.html) from es-toolkit over
sorting with a random comparator.

`arr.sort(() => Math.random() - 0.5)` is not a fair shuffle. A comparator that answers at
random is inconsistent, so the result depends on the engine's sort algorithm and some
orders come out far more often than others. `shuffle` uses the Fisher–Yates algorithm,
which gives every order the same probability and runs in linear time.

## Rule details

This rule reports — it does **not** auto-fix — a `.sort(cb)` or `.toSorted(cb)` call with a
single comparator that ignores its parameters and returns a random sign:

- `Math.random() - 0.5` or `0.5 - Math.random()`;
- `Math.random() > 0.5 ? 1 : -1`, with any of `<`, `>`, `<=`, `>=`, either operand order
  and either branch order.

The comparator is an arrow function with an expression body, or an arrow or function
expression whose body is a single `return` statement. `0.5` is matched by numeric value, so
`.5` counts too.

### ❌ Incorrect

```js
arr.sort(() => Math.random() - 0.5);
[...arr].sort(() => 0.5 - Math.random());
arr.toSorted(() => (Math.random() < 0.5 ? -1 : 1));
arr.sort(function () {
  return Math.random() - 0.5;
});
```

### ✅ Correct

```js
import { shuffle } from 'es-toolkit';

const shuffled = shuffle(arr);

// Not a random comparator — left untouched:
arr.sort((a, b) => a - b);
arr.sort(() => Math.random());
arr.sort((a, b) => Math.random() - a);
```

### In-place sorting

`arr.sort(...)` shuffles `arr` in place, while `shuffle(arr)` returns a new array and leaves
`arr` unchanged. Where the code relies on the mutation, assign the result back:

```js
// Before
arr.sort(() => Math.random() - 0.5);

// After
arr = shuffle(arr);
```

`[...arr].sort(...)`, `arr.slice().sort(...)` and `arr.toSorted(...)` already produce a new
array, so `shuffle(arr)` replaces them directly.

## Limitations

- **Syntactic match.** `Math` is matched by name, so a shadowed local variable named
  `Math` could produce a false positive. This is rare in practice.
- **Receiver type is not checked.** Any `.sort`/`.toSorted` member call with a matching
  comparator is reported, even on a non-array object with its own `sort` method.
- **Inline comparators only.** A comparator passed by reference
  (`const random = () => Math.random() - 0.5; arr.sort(random)`), a constant other than
  `0.5`, or a longer function body is not reported.
- **No auto-fix by design.** `shuffle` returns a new array instead of mutating in place, so
  the rewrite depends on whether the caller relies on the mutation.
