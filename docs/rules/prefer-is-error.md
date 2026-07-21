# prefer-is-error

Prefer [`isError`](https://es-toolkit.dev/reference/predicate/isError.html) over `value instanceof Error`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `Error` binding.
- No auto-fix is provided because adding imports is project-specific.
