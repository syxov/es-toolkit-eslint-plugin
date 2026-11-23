# prefer-tail

Prefer [`tail`](https://es-toolkit.dev/reference/array/tail.html) over `arr.slice(1)`.

## Rule details

This rule reports — it does **not** auto-fix — a `.slice(1)` call, unless the code shows
that the receiver is not an array (see below).

### ❌ Incorrect

```js
items.slice(1);
fn(args.slice(1));

const parts = path.split('/');
parts.slice(1);
```

### ✅ Correct

```js
import { tail } from 'es-toolkit';

tail(items);

// String contexts — left untouched:
s.slice(1).toLowerCase();
s[0].toUpperCase() + s.slice(1); // see prefer-upper-first / prefer-capitalize
`#${id.slice(1)}`;
```

### Not reported: the receiver is not an array

es-toolkit's `tail` takes an array (`readonly T[]`); a string, a typed array or a `Buffer`
does not type-check. A `.slice(1)` is skipped when the syntax or an in-file declaration
shows such a receiver:

```ts
// The receiver is visibly a string.
location.hash.slice(1);
date.toISOString().slice(1);
(useAttrMap.href || '').slice(1);
path.extname(file).slice(1); // `path` imported from 'path' / 'node:path'

// The result is read as a string.
s.slice(1).trim();
parseInt(s.slice(1), 10);
s.slice(1) === 'x';

// The same receiver is read as a string in the statement (or the `if` test).
key.startsWith('_') ? key.slice(1) : key;
if (p.startsWith('/')) p = p.slice(1);

// The in-file declaration shows a string, a typed array or a Buffer.
const ENTRY_PATH = '/entry';
ENTRY_PATH.slice(1);
function strip(value: string) {
  return value.slice(1);
}
const [text, setText] = useState('');
setText(previous => previous.slice(1));
const bytes = Buffer.from(data);
bytes.slice(1);
```

## Limitations

- **No type information.** A string that only its type reveals — a callback parameter, a
  property (`node.data.slice(1)`), the return value of a call (`getHref()?.slice(1)`) or an
  imported constant — is still reported. So is a custom class whose `.slice` returns
  something else.
- An array typed `string[]` or built with `split` is an array and is reported as usual.
- No auto-fix is provided because adding the import is project-specific.
