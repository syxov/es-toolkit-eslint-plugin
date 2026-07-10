# prefer-compact

Prefer [`compact`](https://es-toolkit.dev/reference/array/compact.html) from es-toolkit
over `.filter(Boolean)`.

`compact(arr)` removes all falsy values (`false`, `null`, `0`, `''`, `undefined`, `NaN`) —
exactly what a truthiness filter does, but named and (in TypeScript) better typed.

## Rule details

This rule reports — it does **not** auto-fix — a single-argument truthiness filter:
`.filter(Boolean)`, `.filter(x => !!x)`, or `.filter(x => Boolean(x))`.

### ❌ Incorrect

```js
arr.filter(Boolean);
arr.filter(x => !!x);
arr.filter(x => Boolean(x));
items.filter(Boolean).map(x => x.id);
```

### ✅ Correct

```js
import { compact } from 'es-toolkit';

compact(arr);

// Not a falsy filter — left untouched:
arr.filter(x => x);
arr.filter(x => !!y); // filters by a different value
arr.filter(x => Boolean(x.foo)); // filters by a property, not the element
arr.map(Boolean);
```

## Configuring method-call chains

By default this rule reports only outside a method-call chain. Configure all array-method rules
with `settings['es-toolkit'].arrayMethods.chainPosition`, or override this rule with
`{ chainPosition: 'always' }`. Values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain`. A standalone call is both the start and end.

## Limitations

- **Arrow predicate is identity-checked.** `x => !!x` and `x => Boolean(x)` are reported only
  when the negated/wrapped value is the predicate's own parameter, so `x => !!y` and
  `x => Boolean(x.foo)` are left alone.
- **Syntactic match.** A shadowed local `Boolean` could produce a false positive. This is
  rare in practice.
- **TypeScript bonus.** Beyond readability, `compact` narrows nullable element types, while
  `filter(Boolean)` often leaves them un-narrowed.
- **No auto-fix by design.** The fix requires adding an `import { compact } from 'es-toolkit'`.
