# prefer-head

Prefer [`head`](https://es-toolkit.dev/reference/array/head.html) over `arr[0]`.

**Opt-in:** `arr[0]` is the most common way to read the first element, and it is often
written on purpose, so this rule is `off` in every bundled config, `all` included. Enable it
explicitly:

```js
export default [
  esToolkit.configs.all,
  { rules: { 'es-toolkit/prefer-head': 'error' } },
];
```

## Rule details

This rule reports — it does **not** auto-fix — a read of a computed `[0]` access whose
receiver looks like a list. It skips reads where `[0]` is a position rather than "the first
element", and reads that `head` cannot replace one-to-one.

### ❌ Incorrect

```js
items[0];
const first = rows[0];
const parts = getParts();
parts[0];
```

### ✅ Correct

```js
import { head } from 'es-toolkit';

head(items);
```

### Not reported

```ts
obj['0']; // a string key
items[0] = value; // a write (also `items[0]++`, `delete items[0]`, `[items[0]] = xs`)

// Optional chains: `head(undefined)` throws.
items?.[0];
state.axis?.x[0];

// Characters of a string.
s[0].toUpperCase(); // see prefer-upper-first / prefer-capitalize (also `s[0]!.toUpperCase()`)
host[0] === '*'; // compared with a one-character string
'abc'[0];
str.trim()[0];
function initial(name: string) {
  return name[0];
}

// DOM and other array-like collections.
event.changedTouches[0];
el.childNodes[0];
document.querySelectorAll('a')[0];
event.target.files[0];

// Regex matches and split segments.
/\s*/.exec(text)![0];
const match = re.exec(s);
match[0];
url.split('?')[0];

// Tuples: the same receiver is also read at another literal index.
domain[0] === domain[1];
Object.entries(o).map(entry => entry[0]);
pairs.sort((a, b) => a[0] - b[0]);
const store = useState(create)[0];
scale.domain()[0];
function lon(point: [number, number]) {
  return point[0];
}
intervals[i][0]; // nested index
rows[0][1]; // the first element is itself a tuple

// Argument lists, test-double call data and AST slots: `[0]` is "argument #0".
args[0];
arguments[0];
fn.mock.calls[0][0];
spy.lastCall.args[0];
node.arguments[0];
fn.params[0];

// Copies and selections with a better replacement.
xs.slice(-1)[0]; // `last`
xs.filter(isActive)[0]; // `find`
stack.splice(i, 1)[0]; // the removed item

// Nil checks: see prefer-is-nil, prefer-is-null, prefer-is-undefined.
xs[0] == null;
```

## Limitations

- **The return type changes.** `head(xs)` is `T | undefined`, while `xs[0]` is `T` unless the
  project enables `noUncheckedIndexedAccess`. In a strict TypeScript project without that
  flag, `head(xs).foo` or `const { a } = head(xs)` does not compile, so the rewrite needs an
  explicit `undefined` check.
- **The receiver is not proven to be an array.** Detection is syntactic and has no type
  information. Records keyed by numbers (`lookup[0]`, Express `req.params[0]`), typed arrays
  and `Buffer`s, strings that are not visibly strings, and DOM collections reached through
  helpers (`$$(selector)[0]`) are still reported. `.children[0]` is reported too: about half
  of these are DOM `HTMLCollection`s, the other half are real arrays (AST and tree nodes).
  Passing an array-like to `head` is a TypeScript error.
- **Tuples are recognised by their other indexes.** A tuple read only at `[0]` (a tuple type
  declared elsewhere, a `[key, value]` pair built in another function) is still reported.
  Conversely, a real list that is also read at `[1]` in the same function is skipped.
- `localizedDigits[0] === '0'` (a `string[]` compared with a one-character string) is
  skipped as a string-character read.
- **Test files dominate the hits.** Assertion and fixture reads (`expect(result[0])`) are
  most of the reports on real code bases. If you enable the rule, consider limiting it to
  source files with `files` / `ignores`.
- No auto-fix is provided because adding the import is project-specific.
