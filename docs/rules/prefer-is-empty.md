# prefer-is-empty

Prefer [`isEmpty`](https://es-toolkit.dev/reference/compat/predicate/isEmpty.html) from
`es-toolkit/compat` over checking `Object.keys(obj).length`.

`isEmpty(obj)` answers "does this object have no own enumerable keys?" directly, without
allocating an intermediate keys array.

## Rule details

This rule reports — it does **not** auto-fix — a check of `Object.keys(...).length` against
zero:

- empty: `=== 0` / `== 0` in either operand order, or the `!`-negated length;
- non-empty: `!== 0` / `!= 0` in either operand order, `length > 0` or `0 < length`. Replace
  these with `!isEmpty(obj)`.

### ❌ Incorrect

```js
Object.keys(obj).length === 0;
0 === Object.keys(obj).length;
!Object.keys(obj).length;

Object.keys(obj).length > 0;
Object.keys(obj).length !== 0;
0 < Object.keys(obj).length;
```

### ✅ Correct

```js
import { isEmpty } from 'es-toolkit/compat';

isEmpty(obj);
!isEmpty(obj);

// Not in scope — left untouched:
Object.keys(obj).length === 1;
Object.keys(obj).length === '0';
Object.values(obj).length === 0;
arr.length === 0;
```

## Limitations

- **`es-toolkit/compat` only.** `isEmpty` is not part of the core `es-toolkit` entry point; it
  ships in the lodash-compatible `es-toolkit/compat` module. Its lodash semantics differ from
  `Object.keys(obj).length === 0` for some inputs: `Map`/`Set` are checked by `size`,
  array-likes by `length`, and `null`/`undefined` return `true` instead of throwing.
- **`Object.keys` only.** `Object.values(...)`/`Object.entries(...)` length checks and bare
  `arr.length === 0` / `str.length === 0` are intentionally **not** flagged — they are too
  common and clear to rewrite reliably.
- **Literal `0` only.** Other spellings such as `length >= 1`, `length < 1` or `!!length` are
  not reported (the inner `!Object.keys(obj).length` of `!!…` still is).
- **Syntactic match.** A shadowed local `Object` could produce a false positive.
- **No auto-fix by design.** The fix requires adding an
  `import { isEmpty } from 'es-toolkit/compat'`.
