# prefer-is-reg-exp

Prefer [`isRegExp`](https://es-toolkit.dev/reference/predicate/isRegExp.html) over `value instanceof RegExp`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `RegExp` binding.
- No auto-fix is provided because adding imports is project-specific.
