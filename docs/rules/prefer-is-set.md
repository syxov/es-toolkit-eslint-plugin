# prefer-is-set

Prefer [`isSet`](https://es-toolkit.dev/reference/predicate/isSet.html) over `value instanceof Set`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `Set` binding.
- No auto-fix is provided because adding imports is project-specific.
