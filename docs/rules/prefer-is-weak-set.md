# prefer-is-weak-set

Prefer [`isWeakSet`](https://es-toolkit.dev/reference/predicate/isWeakSet.html) over `value instanceof WeakSet`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `WeakSet` binding.
