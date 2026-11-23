# prefer-last

Prefer [`last`](https://es-toolkit.dev/reference/array/last.html) from es-toolkit over
`arr[arr.length - 1]` and `arr.slice(-1)[0]`.

`last(arr)` reads as "the last element"; `arr[arr.length - 1]` repeats the array and forces
the reader to compute the index.

## Rule details

This rule reports — it does **not** auto-fix — a read of a computed member access whose
index is `<same object>.length - 1`, and `<array>.slice(-1)[0]`, unless the code shows that
the object is not an array (see below).

### ❌ Incorrect

```js
arr[arr.length - 1];
items[items.length - 1];
this.items[this.items.length - 1];
path.split('/').slice(-1)[0];
```

### ✅ Correct

```js
import { last } from 'es-toolkit';

last(arr);

// Not a last-element read — left untouched:
arr[arr.length - 2];
arr[i - 1];
a[b.length - 1]; // the length of a different array
arr[arr.length - 1] = x; // a write (also `++`, `delete`, destructuring targets)
arr.at(-1); // the native equivalent, also fine

// Next to `a[a.length - 2]` in the same statement — rewriting one side breaks the symmetry:
segmentDir(points[points.length - 1], points[points.length - 2]);
```

### Not reported: the object is not an array

es-toolkit's `last` takes an array (`readonly T[]`). A string, a `NodeList` or an
`HTMLCollection` does not type-check, so these are skipped when the syntax or an in-file
declaration shows them:

```ts
// Strings: the declaration, or a string check of the same object in the statement.
function hasSlash(url: string) {
  return url[url.length - 1] === '/';
}
s.endsWith('\n') || s[s.length - 1] === '\r';
typeof v === 'string' && v[v.length - 1] === '"';

// DOM collections.
const cells = document.querySelectorAll('td');
cells[cells.length - 1];
document.head.children[document.head.children.length - 1];
```

## Limitations

- **`last` returns `T | undefined`.** `arr[arr.length - 1]` is typed `T` (unless
  `noUncheckedIndexedAccess` is on), but `last(arr)` is `T | undefined`, as is
  `arr.at(-1)`. Under `strictNullChecks`, `last(arr).prop` does not compile: add a guard
  or `!` when rewriting.
- **No type information.** A string or a DOM collection that only its type reveals — a
  parameter without annotation, a property, `element.children` — is still reported. A
  comparison with a one-character string (`input[input.length - 1] === '.'`) is not taken
  as proof of a string, since a stack of characters reads the same way.
- **Syntactic identity.** The indexed object and the `.length` object must have the same
  source text, so `a[b.length - 1]` is not reported even when `a` and `b` alias the same
  array, and `getArr()[getArr().length - 1]` is reported although the two calls may return
  different arrays.
- **Native alternative.** `arr.at(-1)` is a concise built-in; this rule suggests es-toolkit's
  `last` to keep call sites consistent with the rest of the toolkit.
- **No auto-fix by design.** The fix requires adding an `import { last } from 'es-toolkit'`.
