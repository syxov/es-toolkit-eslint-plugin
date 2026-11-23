# prefer-initial

Prefer [`initial`](https://es-toolkit.dev/reference/array/initial.html) over `arr.slice(0, -1)`.

## Rule details

This rule reports — it does **not** auto-fix — a `.slice(0, -1)` call, unless the code shows
that the receiver is not an array (see below).

### ❌ Incorrect

```js
items.slice(0, -1);
parts.slice(0, -1).join('/');
```

### ✅ Correct

```js
import { initial } from 'es-toolkit';

initial(items);

// String contexts — left untouched:
s.slice(0, -1).toLowerCase();
s.slice(0, -1) + '…';
`${path.slice(0, -1)}/`;
```

### Not reported: the receiver is not an array

es-toolkit's `initial` takes an array (`readonly T[]`); a string, a typed array or a
`Buffer` does not type-check. A `.slice(0, -1)` is skipped when the syntax or an in-file
declaration shows such a receiver:

```ts
// The receiver or the result is visibly a string.
x.toFixed(2).slice(0, -1);
s.slice(0, -1).split(',');

// The same receiver is read as a string in the statement (or the `if` test).
urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath;
if (dir.endsWith('/')) dir = dir.slice(0, -1);
outerPath.slice(-1) === 'Z' ? outerPath.slice(0, -1) : outerPath;

// The in-file declaration shows a string or a typed array.
function trim(input: string) {
  return input.slice(0, -1);
}
const bytes = new Uint8Array(8);
bytes.slice(0, -1);
```

## Limitations

- **No type information.** A string that only its type reveals — a callback parameter, a
  property (`node.data.slice(0, -1)`), the return value of a call or an imported
  constant — is still reported.
- No auto-fix is provided because adding the import is project-specific.
