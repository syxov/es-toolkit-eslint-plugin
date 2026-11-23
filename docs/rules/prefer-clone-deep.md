# prefer-clone-deep

Prefer [`cloneDeep`](https://es-toolkit.dev/reference/object/cloneDeep.html) from es-toolkit
over a `JSON.parse(JSON.stringify(x))` round-trip.

Serializing a value to JSON and parsing it back is a common way to deep-copy it, but it
states the intent indirectly and is lossy: anything JSON cannot represent is dropped or
changed along the way. `cloneDeep(x)` names the intent and copies the value faithfully.

## Rule details

> **Opt-in.** This rule is `off` in every bundled config, `all` included. Enable it with
> `'es-toolkit/prefer-clone-deep': 'error'`.

It is opt-in because the JSON round-trip is often chosen for its lossy semantics: to strip
`undefined` keys, class instances or functions, or to check that a value is serialisable.
`cloneDeep` keeps all of those, so the rewrite changes behaviour.

This rule reports — it does **not** auto-fix — a `JSON.parse` call whose only argument is
directly a `JSON.stringify` call with exactly one non-spread argument. Both calls must be
non-computed member accesses on the identifier `JSON`.

It is not reported where the context shows the JSON semantics are the point:

- inside an `expect(…)` call or a matcher argument (`expect(a).toEqual(…)`), which asserts
  what survives JSON;
- inside a call whose name starts with `bench` (`benchmark(…)`, `bench(…)`), which measures
  the round-trip itself;
- inside a function whose name mentions serialising, sanitising, JSON, detaching or plain
  objects (`sanitizeError`, `toSerializableMeta`, `detachSnapshot`, `toPlainObject`; matched
  by `/seriali[sz]|saniti[sz]|json|detach|plain/i`), or in the initialiser of a variable
  whose name mentions JSON or plain data (`resultJson`; `/json|plain/i`). A variable such as
  `serialized` only names what it holds, so a clone assigned to it is still reported.

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

// The JSON semantics are the point — left untouched:
expect(JSON.parse(JSON.stringify(ast))).toEqual(ast);
function sanitizeError(error) {
  return { ...JSON.parse(JSON.stringify(error)), message: error.message };
}
```

## Limitations

- **Behaviour can change.** The JSON round-trip drops `undefined` values and functions,
  turns a `Date` into a string, turns `Map`/`Set` into `{}`, turns `NaN`/`Infinity` into
  `null`, and throws on circular references. `cloneDeep` keeps all of these. Code that
  relies on the lossy round-trip (for example to strip `undefined` keys or to normalize
  dates to strings) behaves differently after switching, so review each report. Only the
  contexts listed above are recognised; a deliberate round-trip elsewhere (an event turned
  into plain data, code under an `eslint-disable` for `unicorn/prefer-structured-clone`) is
  still reported.
- **Names are a heuristic.** A function named `toJson` that really wants a faithful copy is
  skipped, and a benchmark is recognised only by the name of the call that wraps it, not by
  its file path.
- **Syntactic match.** `JSON` is matched by name, so a shadowed local variable named `JSON`
  could produce a false positive. Computed access such as `JSON['parse']` is not reported.
- **Direct nesting only.** The `JSON.stringify` call must be the direct argument of
  `JSON.parse`; a round-trip through a variable or a wrapper call is not reported.
- **Single argument only.** A replacer, indentation or reviver argument changes the
  round-trip, so those calls are not reported.
- **No auto-fix by design.** The fix requires adding an
  `import { cloneDeep } from 'es-toolkit'`, so the rule only reports.
