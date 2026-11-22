# prefer-clone-deep

Prefer [`cloneDeep`](https://es-toolkit.dev/reference/object/cloneDeep.html) from es-toolkit
over a `JSON.parse(JSON.stringify(x))` round-trip.

Serializing a value to JSON and parsing it back is a common way to deep-copy it, but it
states the intent indirectly and is lossy: anything JSON cannot represent is dropped or
changed along the way. `cloneDeep(x)` names the intent and copies the value faithfully.

## Rule details

This rule reports — it does **not** auto-fix — a `JSON.parse` call whose only argument is
directly a `JSON.stringify` call with exactly one non-spread argument. Both calls must be
non-computed member accesses on the identifier `JSON`.

### ❌ Incorrect

```js
const copy = JSON.parse(JSON.stringify(original));
setState(JSON.parse(JSON.stringify(state)));
const items = list.map(item => JSON.parse(JSON.stringify(item)));
```

### ✅ Correct

```js
import { cloneDeep } from 'es-toolkit';

const copy = cloneDeep(original);

// The native deep clone is fine too:
const copy2 = structuredClone(original);

// Not a plain round-trip — left untouched:
JSON.parse(JSON.stringify(x, replacer));
JSON.parse(JSON.stringify(x, null, 2));
JSON.parse(JSON.stringify(x), reviver);
JSON.parse(text);
JSON.parse(JSON.stringify(x) + '');
```

## Limitations

- **Behaviour can change.** The JSON round-trip drops `undefined` values and functions,
  turns a `Date` into a string, turns `Map`/`Set` into `{}`, turns `NaN`/`Infinity` into
  `null`, and throws on circular references. `cloneDeep` keeps all of these. Code that
  relies on the lossy round-trip (for example to strip `undefined` keys or to normalize
  dates to strings) behaves differently after switching, so review each report.
- **Syntactic match.** `JSON` is matched by name, so a shadowed local variable named `JSON`
  could produce a false positive. Computed access such as `JSON['parse']` is not reported.
- **Direct nesting only.** The `JSON.stringify` call must be the direct argument of
  `JSON.parse`; a round-trip through a variable or a wrapper call is not reported.
- **Single argument only.** A replacer, indentation or reviver argument changes the
  round-trip, so those calls are not reported.
- **No auto-fix by design.** The fix requires adding an
  `import { cloneDeep } from 'es-toolkit'`, so the rule only reports.
