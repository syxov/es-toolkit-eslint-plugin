# prefer-is-subset

Prefer [`isSubset`](https://es-toolkit.dev/reference/array/isSubset.html) from es-toolkit over
`subset.every(x => superset.includes(x))`.

Checking that every element of one array occurs in another is `isSubset(superset, subset)` —
the question is in the name, and the lookup is a `Set` (`O(n + m)`) instead of an `includes`
scan per element (`O(n * m)`).

## Rule details

This rule reports — it does **not** auto-fix — a single-parameter arrow `.every` whose body is
`<other>.includes(<param>)`. Note the argument order of the rewrite: the array searched by
`includes` comes first.

### ❌ Incorrect

```js
subset.every(x => superset.includes(x));
Object.keys(options).every(key => allowedKeys.includes(key));
```

### ✅ Correct

```js
import { isSubset } from 'es-toolkit';

isSubset(superset, subset);
isSubset(allowedKeys, Object.keys(options));

// Not an `isSubset` — left untouched:
subset.every(x => set.has(x)); // `isSubset` takes arrays
chars.every(c => 'abcdef'.includes(c)); // substring test on a string
words.every(w => getText().includes(w)); // a call result may be a string
subset.every(x => superset.includes(x.id)); // compares a property
subset.every(x => x.tags.includes(x)); // the receiver depends on the element
subset?.every(x => superset.includes(x)); // optional call
```

## Limitations

- **String receivers.** A string or template literal receiver is skipped, and so is any call
  result other than `Array.from(…)`, `Object.keys(…)` and `Object.values(…)`, and any variable
  declared in the file as a string (an annotation, a string initial value or default). A
  receiver named like a single string (`text`, `name`, `expose.type`, `fileName`) is skipped
  too. Any other string from elsewhere looks the same as an array and is still reported.
- **Not a chain-aware rule.** `.every` returns a boolean, so the call can only end a chain;
  `xs.map(f).every(…)` is reported as `isSubset(superset, xs.map(f))`.
- **Arrow callbacks with an expression body only.** A `function` callback, a block body or a
  callback that reads its index is not matched.
- **`includes` only.** `superset.indexOf(x) !== -1` and `set.has(x)` are not matched.
- **Optional calls are skipped**: `isSubset` would throw on a nil array.
- **No auto-fix by design.** The fix requires adding an
  `import { isSubset } from 'es-toolkit'`.
