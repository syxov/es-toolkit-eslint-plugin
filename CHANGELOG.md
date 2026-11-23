# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org); while it is `0.x`, minor releases may contain
breaking changes.

## [0.3.0] - 2026-11-23

False positives found by linting a corpus of 10 popular repositories (`pnpm corpus`) are
removed. Every default-on rule together reports 14,105 instead of 32,815 hits there.

### Breaking changes

- **`prefer-head` and `prefer-clone-deep` are opt-in** (`'off'` even in `configs.all`).
  `head(xs)` behaves exactly like `xs[0]` and returns `T | undefined`, so most reports were
  noise; the JSON round-trip is often deliberate serialisation, not a clone.
- **`prefer-in-range` reports numeric-literal bounds only** (`lower < upper`): es-toolkit's
  `inRange` throws when `lower >= upper`, so `i >= 0 && i < xs.length` would throw on an
  empty array.
- **`prefer-round` no longer reports `Number(x.toFixed(n))`**: it rounds decimal ties
  differently from `round`.
- **`prefer-without` skips type-predicate callbacks by default** (`skipTypePredicate: true`)
  and never reports `null`, `undefined`, `void 0` or `false` exclusions, which TypeScript
  narrows and `without` would widen. `xs.filter(x => x !== null)` is now reported by
  `prefer-is-null` (`prefer-is-undefined` for `undefined`).

### Fixed

- **Runtime errors:** `typeof X` on an identifier the code does not declare (`window`,
  `process`, `requestAnimationFrame`, ambient `declare const`) is no longer reported by the
  `typeof` predicate rules — `isUndefined(window)` throws a ReferenceError where `window` is
  missing. `prefer-head` skips optional chains (`head(undefined)` throws), `prefer-delay`
  skips functions passed to `page.evaluate`-like calls.
- **Non-array receivers:** `prefer-tail`, `prefer-initial`, `prefer-take`, `prefer-take-right`
  and `prefer-last` skip strings recognisable from the expression or its in-file
  declaration, typed arrays, `Buffer` and DOM collections. `prefer-head` skips string
  characters, DOM collections, regex matches, `split()` segments, test-double call data,
  argument lists and tuples (the same receiver read at another index in the function).
- **Not the idiom:**
  - `prefer-clamp`: interval normalisation with a mirrored `Math.min`/`Math.max` pair, and
    `Math.min(i, Math.max(0, xs.length - 1))`; a nested clamp is reported once.
  - Predicate rules: `typeof x === 'object' && x !== null` object probes, one value tested
    against several types in one chain (previously 2–3 reports), `??`/`??=`/`?.` shapes,
    `expect(typeof …)` assertions, and files that already bind the helper's name.
  - `prefer-flatten` / `prefer-flat-map`: `[x].flat()` normalise-to-array.
  - `prefer-take`: splice pairs and `slice(0, a.length - k)`.
  - `prefer-debounce`: one-shot flag resets and `.unref()`'d timers.
  - `prefer-random-int`: Fisher–Yates swap loops.
  - `prefer-noop`: named function expressions, typed parameters, `mockImplementation(…)`.
  - `prefer-identity`: `.map(x => x)` and typed or generic arrows.
  - `prefer-escape-reg-exp`: a character class that also escapes `-`.
  - Collection rules: `xs?.filter(…)` receivers, `.filter(Boolean).length` counts, string or
    call `includes` receivers, `.match()` results; Map/Set iterators in `prefer-union` now
    go to `prefer-uniq`.
- **One report per snippet:** `xs.slice(-1)[0]` is reported only by `prefer-last` (was
  `prefer-take-right` + `prefer-head`); `xs[0] == null` only by the nil predicate rules.

### Documentation

- Limitations now cover what needs type information: `T | undefined` from `head`/`last`,
  narrowing of generic and discriminated-union operands, `isNotNil` on `unknown`, strings
  known only from types, and `Math.max(lower, Math.min(v, upper))` differing from `clamp`
  when `lower > upper`.

## [0.2.1] - 2026-11-22

### Fixed

- `prefer-clamp` no longer reports a symmetric min/max where both arguments are the opposite
  call, e.g. the interval-overlap test `Math.max(Math.min(a, b), Math.min(c, d))`. It is not
  equivalent to `clamp` when the lower bound exceeds the upper one.

## [0.2.0] - 2026-11-22

### Breaking changes

- **Configs are now split by es-toolkit category.** `configs.utilities` and
  `configs['array-methods']` are removed. Use the category configs `array`, `function`,
  `math`, `object`, `predicate`, `promise`, `string`, or `all` for every rule:

  ```diff
   export default [
  -  esToolkit.configs.utilities,
  -  esToolkit.configs['array-methods'],
  +  esToolkit.configs.all,
   ];
  ```

- `@typescript-eslint/utils` moved from `peerDependencies` to `dependencies`; consumers no
  longer need to install it.
- `prefer-without` reports `arr.filter(x => x != value)` only with the new
  `checkLooseInequality: true` option.

### New rules

- Array: [`prefer-key-by`](docs/rules/prefer-key-by.md),
  [`prefer-shuffle`](docs/rules/prefer-shuffle.md),
  [`prefer-uniq-by`](docs/rules/prefer-uniq-by.md),
  [`prefer-zip`](docs/rules/prefer-zip.md)
- Math: [`prefer-round`](docs/rules/prefer-round.md)
- Object: [`prefer-clone-deep`](docs/rules/prefer-clone-deep.md),
  [`prefer-map-values`](docs/rules/prefer-map-values.md)
- String: [`prefer-escape-reg-exp`](docs/rules/prefer-escape-reg-exp.md)
- Opt-in (`off` in every config, `all` included):
  [`prefer-take`](docs/rules/prefer-take.md),
  [`prefer-take-right`](docs/rules/prefer-take-right.md),
  [`prefer-debounce`](docs/rules/prefer-debounce.md),
  [`prefer-identity`](docs/rules/prefer-identity.md),
  [`prefer-noop`](docs/rules/prefer-noop.md)

### Fixed

- One report per snippet: with every rule enabled, each idiom is reported by exactly one
  rule (`prefer-flatten` vs `prefer-flat-map`, `prefer-head`/`prefer-tail` vs the string
  rules, `prefer-sample` vs `prefer-random-int`, `prefer-is-null`/`prefer-is-undefined` vs
  `prefer-is-nil`, `prefer-sum-by` vs `prefer-mean-by`).
- Number and `null` literals are matched by their raw text, so `'0'` and `'null'` strings no
  longer match.
- `prefer-last`, `prefer-sample`, `prefer-mean`, `prefer-mean-by` and
  `prefer-is-typed-array` require the same receiver on both sides.
- `prefer-head`/`prefer-last` skip assignment targets; `prefer-without`,
  `prefer-difference` and `prefer-intersection` skip values that read the callback
  parameter; `prefer-union` reports only for exactly two arrays.
- `prefer-is-empty` points to `es-toolkit/compat`, where `isEmpty` lives.
- `plugin.meta.version` is read from `package.json` instead of being hard-coded.
- The plugin is typed with ESLint's own `Plugin`/`Config` types, so
  `defineConfig([esToolkit.configs.all])` type-checks in `eslint.config.ts`.

### Changed

- Wider detection: `filter(x => x)`, `flat(1)`, seedless `reduce` sums and means, more
  `inRange` orders, `range` via `.map`/`.fill` chains and `function` mappers, `delay` with
  `() => resolve()`, template-literal and `substring` forms of the string rules, `==`/`!=`
  and `typeof … === 'undefined'`/`void 0` in the predicate rules.

## [0.1.4] - 2026-07-21

Last release before this changelog was started.

[0.3.0]: https://github.com/syxov/es-toolkit-eslint-plugin/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/syxov/es-toolkit-eslint-plugin/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/syxov/es-toolkit-eslint-plugin/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/syxov/es-toolkit-eslint-plugin/releases/tag/v0.1.4
