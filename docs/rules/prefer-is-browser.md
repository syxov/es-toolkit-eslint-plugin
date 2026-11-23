# prefer-is-browser

Prefer [`isBrowser`](https://es-toolkit.dev/reference/predicate/isBrowser.html) from
es-toolkit over hand-written `typeof window` checks.

`isBrowser()` is `typeof window !== 'undefined' && window?.document != null`: a named check
for the environment, safe where `window` is not declared at all.

## Rule details

This rule reports — it does **not** auto-fix — on the global `window`:

- `typeof window !== 'undefined'` (also `!=`, either operand order), replaced by
  `isBrowser()`;
- `typeof window === 'undefined'` (also `==`), replaced by `!isBrowser()`;
- a window check paired with a document check, reported once for the whole pair:
  `typeof window !== 'undefined' &&` followed by `typeof document !== 'undefined'`,
  `window.document`, `!!window.document`, `Boolean(window.document)`,
  `window.document != null`, `window.document !== undefined` or
  `typeof window.document !== 'undefined'` (the `typeof document` form also in the other
  order), and the negations joined by `||` (`typeof window === 'undefined' || !window.document`).

A `window` the code declares itself (a parameter, a variable, an import) is not the global,
so checks on it are left alone. Ambient declarations (`declare const window: …`) do count as
the global.

### ❌ Incorrect

```js
typeof window !== 'undefined';
typeof window === 'undefined';
typeof window !== 'undefined' && typeof document !== 'undefined';
typeof window !== 'undefined' && window.document;

const useEnhancedEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
```

### ✅ Correct

```js
import { isBrowser } from 'es-toolkit';

isBrowser();
!isBrowser();

const useEnhancedEffect = isBrowser() ? React.useLayoutEffect : React.useEffect;

// Not reported:
typeof document !== 'undefined'; // see below
typeof window.matchMedia === 'function';
function f(window) {
  return typeof window !== 'undefined'; // a parameter, not the global
}
```

### Not reported

```ts
// A global-object lookup that falls back to another global: `globalThis` is the rewrite.
const root = typeof window !== 'undefined' ? window : global;
// A test assertion.
expect(typeof window !== 'undefined').toBe(true);
// The code already has its own `isBrowser`.
const isBrowser = typeof window !== 'undefined';
```

## Options

### `reportLoneWindowCheck`

`reportLoneWindowCheck` defaults to `true`: a `typeof window` check is reported on its own.
Set it to `false` to report only window + document pairs:

```js
{
  rules: {
    'es-toolkit/prefer-is-browser': ['error', { reportLoneWindowCheck: false }],
  },
}
```

`isBrowser()` also requires `window.document`, so it is stricter than a lone
`typeof window !== 'undefined'`. The two differ where a `window` global exists without a
document: Deno 1.x, web workers or server code with a `window` polyfill, and some test
environments. Where code relies on `window` alone (for example `window.localStorage` in such
an environment), the rewrite changes behavior; turn the option off to keep those checks.

## Limitations

- **`typeof document` alone is not reported.** It tests for a document, not for a window;
  rewriting it as `isBrowser()` would add a `window` requirement the code did not have.
- **Adjacent pairs only.** A document check counts as part of the pair only when it directly
  follows the window check in the same `&&` (or `||`) chain:
  `typeof window !== 'undefined' && ready && window.document` reports only the window check.
- **Global-object lookups.** `typeof window !== 'undefined' ? window : <fallback>` (also with
  more `&&` tests, or negated) is skipped when the fallback is anything but `null` /
  `undefined`: it picks the global object, which `globalThis` names. With a `null` /
  `undefined` fallback it is reported, as `isBrowser() ? window : null`.
- **Other spellings.** `typeof window === 'object'`, `typeof globalThis.window`,
  `'window' in globalThis` and checks of `self` are not reported.
- **Test assertions.** A check passed straight to `expect(…)` is not reported.
- **Own helper in scope.** When the code already sees a binding named `isBrowser` (often the
  constant that holds the check), the check is not reported. An import of `isBrowser` from
  `es-toolkit` does not count.
- **No auto-fix by design.** The fix requires adding an
  `import { isBrowser } from 'es-toolkit'`.
