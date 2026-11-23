# prefer-is-plain-object

Prefer [`isPlainObject`](https://es-toolkit.dev/reference/predicate/isPlainObject.html) from
es-toolkit over hand-written plain-object checks.

`isPlainObject(value)` is true for objects whose prototype is `Object.prototype` or `null`
(object literals, `new Object()`, `Object.create(null)`, objects from another realm) and
whose `Object.prototype.toString` tag is `[object Object]`. It is false for `null`,
primitives, arrays, class instances and built-ins such as `Date` or `Map`, and it never
throws.

## Rule details

This rule reports — it does **not** auto-fix — these comparisons, with any equality
operator (`===`, `!==`, `==`, `!=`) and in either operand order:

- `Object.prototype.toString.call(value) === '[object Object]'`, also through `{}.toString`
  or a constant alias (`const toString = Object.prototype.toString`,
  `const { toString } = Object.prototype`);
- `Object.getPrototypeOf(value) === Object.prototype`, alone or paired with
  `Object.getPrototypeOf(value) === null` (negated: `!==` joined by `&&`), also through a
  constant that holds the prototype (`const proto = Object.getPrototypeOf(value)`);
- `value.constructor === Object` (also `value?.constructor`).

A pair is reported once, for the whole pair. The `null` / `typeof value === 'object'` guards
around such a check are part of the rewrite, so the nil rules (`prefer-is-null`,
`prefer-is-not-nil`, …) leave them to this rule.

### ❌ Incorrect

```js
Object.prototype.toString.call(value) === '[object Object]';
Object.getPrototypeOf(value) === Object.prototype;
Object.getPrototypeOf(value) === Object.prototype
  || Object.getPrototypeOf(value) === null;
value.constructor === Object;

const proto = Object.getPrototypeOf(row);
if (proto === Object.prototype || proto === null) copy(row);

if (
  value !== null
  && typeof value === 'object'
  && Object.getPrototypeOf(value) === Object.prototype
)
  walk(value);
```

### ✅ Correct

```js
import { isPlainObject } from 'es-toolkit';

isPlainObject(value);
if (isPlainObject(row)) copy(row);
if (isPlainObject(value)) walk(value);

// Not a plain-object check — left untouched:
Object.prototype.toString.call(value) === '[object Array]';
const tag = Object.prototype.toString.call(value); // compared later, often a dispatch
Object.getPrototypeOf(value) === null; // prefer-is-null
value.constructor === Array;
```

### Not reported

```ts
// A test assertion.
expect(Object.getPrototypeOf(value) === Object.prototype).toBe(true);
// The code already has its own `isPlainObject`.
const isPlainObject = (v: object) =>
  Object.getPrototypeOf(v) === Object.prototype;
```

## Limitations

The hand-written checks are close to `isPlainObject`, not identical. Review each rewrite
where the difference matters:

| Value                                    | `toString` tag | `getPrototypeOf` only | `getPrototypeOf` + `null` | `constructor` | `isPlainObject` |
| ---------------------------------------- | -------------- | --------------------- | ------------------------- | ------------- | --------------- |
| `{}`, `new Object()`                     | true           | true                  | true                      | true          | true            |
| `Object.create(null)`                    | true           | false                 | true                      | false         | true            |
| `new (class Foo {})()`                   | **true**       | false                 | false                     | false         | false           |
| `Object.create({})`                      | **true**       | false                 | false                     | **true**      | false           |
| object from another realm (`vm`, iframe) | true           | false                 | false                     | false         | true            |
| `{ [Symbol.toStringTag]: 'X' }`          | false          | **true**              | **true**                  | **true**      | false           |
| `null`, `undefined`                      | false          | throws                | throws                    | throws        | false           |

- **The `toString` tag is looser.** It is `[object Object]` for class instances and objects
  with any custom prototype, which `isPlainObject` rejects. That is usually what such code
  means (clone or merge only plain data), but code that relies on matching class instances
  changes behavior.
- **The prototype and `constructor` checks are stricter.** They reject `Object.create(null)`
  (unless paired with `=== null`) and objects from another realm, which `isPlainObject`
  accepts. They throw on `null` / `undefined`, where `isPlainObject` returns `false`.
- **A stored tag is not followed.** `const tag = toString.call(v); tag === '[object Object]'`
  is not reported: the tag is usually compared with several values. Neither is
  `toString.call(v).slice(8, -1) === 'Object'`.
- **Global `toString`.** A bare `toString.call(v)` is reported only when `toString` is a
  constant alias of `Object.prototype.toString` declared in the file, not when it resolves to
  the global object's inherited `toString`.
- **Syntactic match.** `Object` is matched by name, so a shadowed local `Object` binding could
  produce a false positive.
- **Test assertions.** A check passed straight to `expect(…)` is not reported.
- **Own helper in scope.** When the code already sees a binding named `isPlainObject` (for
  example the function that implements it), the check is not reported. An import of
  `isPlainObject` from `es-toolkit` does not count.
- **No auto-fix by design.** The fix requires adding an
  `import { isPlainObject } from 'es-toolkit'` and, often, removing the guards around the
  check.
