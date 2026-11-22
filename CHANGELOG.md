# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org); while it is `0.x`, minor releases may contain
breaking changes.

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

[0.2.0]: https://github.com/syxov/es-toolkit-eslint-plugin/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/syxov/es-toolkit-eslint-plugin/releases/tag/v0.1.4
