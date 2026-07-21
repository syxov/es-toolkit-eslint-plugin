# prefer-is-blob

Prefer [`isBlob`](https://es-toolkit.dev/reference/predicate/isBlob.html) over `value instanceof Blob`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `Blob` binding.
