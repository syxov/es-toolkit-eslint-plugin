# prefer-is-typed-array

Prefer [`isTypedArray`](https://es-toolkit.dev/reference/predicate/isTypedArray.html) over a manual ArrayBuffer view check.

## Limitations

- Only the `ArrayBuffer.isView(value) && !(value instanceof DataView)` order is detected; the
  reversed order is not reported, and neither is the check when other operands precede it in
  the same `&&` chain (`ready && ArrayBuffer.isView(value) && …`).
- The rule does not compare the two operands, so `ArrayBuffer.isView(a) && !(b instanceof DataView)`
  is reported as well.
- The rule is syntactic and does not inspect shadowed `ArrayBuffer` or `DataView` bindings.
- No auto-fix is provided because adding imports is project-specific.
