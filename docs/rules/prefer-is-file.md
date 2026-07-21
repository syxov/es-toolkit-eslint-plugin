# prefer-is-file

Prefer [`isFile`](https://es-toolkit.dev/reference/predicate/isFile.html) over `value instanceof File`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `File` binding.
