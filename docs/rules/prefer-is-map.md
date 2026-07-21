# prefer-is-map

Prefer [`isMap`](https://es-toolkit.dev/reference/predicate/isMap.html) over `value instanceof Map`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `Map` binding.
- No auto-fix is provided because adding imports is project-specific.
