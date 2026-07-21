# prefer-is-weak-map

Prefer [`isWeakMap`](https://es-toolkit.dev/reference/predicate/isWeakMap.html) over `value instanceof WeakMap`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `WeakMap` binding.
