# prefer-find-key

Prefer [`findKey`](https://es-toolkit.dev/reference/object/findKey.html) from es-toolkit over
`Object.keys(o).find(k => pred(o[k]))` and `Object.entries(o).find(([k, v]) => pred(v))?.[0]`.

Searching an object's keys and reading the value back by key, or searching its entries and
taking the key of the match, spells out the lookup. `findKey(o, v => pred(v))` hands the
callback the value directly and returns the key.

## Rule details

This rule reports — it does **not** auto-fix — two shapes:

- `Object.keys(o).find(callback)`, with no `thisArg`, where the callback is an arrow or
  function expression with exactly one plain identifier parameter `k` and reads `o[k]` — the
  same object at the key (a type cast on either `o` is ignored). A write such as `o[k] = …`
  does not count.
- `Object.entries(o).find(callback)[0]`, `…?.[0]` or `…![0]`, where the callback is an arrow
  or function expression whose single parameter is an array pattern `[k, v]` or `[, v]` and
  whose body reads the value parameter `v`.

A callback that only looks at the key (`Object.keys(o).find(k => k.startsWith('x'))`) is not
a `findKey`, and is not reported.

### ❌ Incorrect

```ts
const id = Object.keys(users).find(id => users[id].name === name);
Object.keys(o).find(function (k) {
  return o[k].active;
});
const version = Object.entries(versions).find(
  ([, url]) => url === current,
)?.[0];
```

### ✅ Correct

```ts
import { findKey } from 'es-toolkit';

const id = findKey(users, user => user.name === name);
findKey(o, v => v.active);
const version = findKey(versions, url => url === current);

// Not a findKey — left untouched:
Object.keys(o).find(k => k.startsWith('x')); // only the key is tested
Object.keys(o).find(k => other[k]); // another object
Object.entries(o).find(([, v]) => v.active); // the entry, not its key
Object.entries(o).find(([, v]) => v.active)?.[1]; // the value
```

## Limitations

- **Syntactic match.** `Object` is matched by name, so a shadowed local variable named
  `Object` could produce a false positive. `o` and the object read in the callback are
  compared by source text: when `o` is a call such as `get()`, both calls are taken as the
  same object.
- **Destructured entries only.** `Object.entries(o).find(e => e[1].active)?.[0]` is not
  detected.
- **`[0]` must follow directly.** An entry stored in a variable and indexed later is not
  reported.
- **No auto-fix by design.** The fix requires adding an `import { findKey } from 'es-toolkit'`
  and turning the key callback into a value callback, so the rule only reports.
