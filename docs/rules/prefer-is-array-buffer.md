# prefer-is-array-buffer

Prefer [`isArrayBuffer`](https://es-toolkit.dev/reference/predicate/isArrayBuffer.html) over `value instanceof ArrayBuffer`.

## Limitations

- The rule is syntactic and does not inspect a shadowed `ArrayBuffer` binding.
