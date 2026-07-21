# prefer-is-date

Prefer [`isDate`](https://es-toolkit.dev/reference/predicate/isDate.html) over `value instanceof Date`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `Date` binding.
- No auto-fix is provided because adding imports is project-specific.
