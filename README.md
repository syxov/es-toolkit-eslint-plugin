# es-toolkit-eslint-plugin

[![npm](https://img.shields.io/npm/v/es-toolkit-eslint-plugin)](https://www.npmjs.com/package/es-toolkit-eslint-plugin)
[![CI](https://github.com/syxov/es-toolkit-eslint-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/syxov/es-toolkit-eslint-plugin/actions/workflows/ci.yml)

An ESLint plugin that suggests [es-toolkit](https://es-toolkit.dev) utilities in place of
hand-written JS/TS.

```js
Math.min(Math.max(level, 0), 100);
// es-toolkit/prefer-clamp: Prefer `clamp` from es-toolkit instead of nesting `Math.min`/`Math.max`.
```

Rules only report; there is no auto-fix. A utility can behave differently from the code it
replaces for some inputs, so check the rule's **Limitations** before rewriting.

> [!WARNING]
> **Early stage.** False positives are possible. Please
> [file issues](https://github.com/syxov/es-toolkit-eslint-plugin/issues).

## Requirements

- ESLint 10 with flat config.
- For TypeScript files, a parser such as typescript-eslint's; see
  [Configuration](docs/configuration.md#typescript).
- `es-toolkit` in your project once you apply the suggestions. The plugin itself does not
  depend on it.

## Install

```sh
pnpm add -D es-toolkit-eslint-plugin
```

## Usage

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import esToolkit from 'es-toolkit-eslint-plugin';

export default defineConfig([esToolkit.configs.all]);
```

## Configs

- `configs.all` enables every rule marked ✅ below.
- `configs.array`, `configs.function`, `configs.math`, `configs.object`,
  `configs.predicate`, `configs.promise` and `configs.string` enable the ✅ rules of one
  category.

Rules without ✅ are **opt-in**: they match idioms that are often written on purpose
(`arr[0]`, `arr.slice(0, n)`, `() => {}`), so no config enables them, `all` included. Turn
one on by name:

```js
export default defineConfig([
  esToolkit.configs.all,
  { rules: { 'es-toolkit/prefer-noop': 'error' } },
]);
```

## Rules

### Array

| Rule                                                             | Description                                                        | Enabled in presets |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ | :----------------: |
| [`prefer-chunk`](docs/rules/prefer-chunk.md)                     | `chunk` instead of slicing in a loop                               |         ✅         |
| [`prefer-compact`](docs/rules/prefer-compact.md)                 | `compact` instead of `.filter(Boolean)`                            |         ✅         |
| [`prefer-difference`](docs/rules/prefer-difference.md)           | `difference` instead of filtering by `!includes`                   |         ✅         |
| [`prefer-difference-by`](docs/rules/prefer-difference-by.md)     | `differenceBy` instead of filtering by `!some` on a key            |         ✅         |
| [`prefer-difference-with`](docs/rules/prefer-difference-with.md) | `differenceWith` instead of filtering by `!some` with a comparator |         ✅         |
| [`prefer-flat-map`](docs/rules/prefer-flat-map.md)               | `flatMap` instead of `.map().flat()`                               |         ✅         |
| [`prefer-flat-map-deep`](docs/rules/prefer-flat-map-deep.md)     | `flatMapDeep` instead of `.map().flat(Infinity)`                   |         ✅         |
| [`prefer-flatten`](docs/rules/prefer-flatten.md)                 | `flatten` instead of `.flat()`                                     |         ✅         |
| [`prefer-flatten-deep`](docs/rules/prefer-flatten-deep.md)       | `flattenDeep` instead of `.flat(Infinity)`                         |         ✅         |
| [`prefer-head`](docs/rules/prefer-head.md)                       | `head` instead of `arr[0]`                                         |                    |
| [`prefer-initial`](docs/rules/prefer-initial.md)                 | `initial` instead of `arr.slice(0, -1)`                            |         ✅         |
| [`prefer-intersection`](docs/rules/prefer-intersection.md)       | `intersection` instead of filtering by `includes`                  |         ✅         |
| [`prefer-is-subset`](docs/rules/prefer-is-subset.md)             | `isSubset` instead of `every` + `includes`                         |         ✅         |
| [`prefer-key-by`](docs/rules/prefer-key-by.md)                   | `keyBy` instead of `Object.fromEntries` over `map`                 |         ✅         |
| [`prefer-last`](docs/rules/prefer-last.md)                       | `last` instead of `arr[arr.length - 1]`                            |         ✅         |
| [`prefer-sample`](docs/rules/prefer-sample.md)                   | `sample` instead of a random index                                 |         ✅         |
| [`prefer-shuffle`](docs/rules/prefer-shuffle.md)                 | `shuffle` instead of sorting with a random comparator              |         ✅         |
| [`prefer-tail`](docs/rules/prefer-tail.md)                       | `tail` instead of `arr.slice(1)`                                   |         ✅         |
| [`prefer-take`](docs/rules/prefer-take.md)                       | `take` instead of `arr.slice(0, n)`                                |                    |
| [`prefer-take-right`](docs/rules/prefer-take-right.md)           | `takeRight` instead of `arr.slice(-n)`                             |                    |
| [`prefer-union`](docs/rules/prefer-union.md)                     | `union` instead of a `Set` of two spread arrays                    |         ✅         |
| [`prefer-uniq`](docs/rules/prefer-uniq.md)                       | `uniq` instead of a `Set` round-trip                               |         ✅         |
| [`prefer-uniq-by`](docs/rules/prefer-uniq-by.md)                 | `uniqBy` instead of a keyed `Map` round-trip                       |         ✅         |
| [`prefer-without`](docs/rules/prefer-without.md)                 | `without` instead of filtering by `!==`                            |         ✅         |
| [`prefer-zip`](docs/rules/prefer-zip.md)                         | `zip` instead of pairing by index in `map`                         |         ✅         |

### Function

| Rule                                               | Description                                         | Enabled in presets |
| -------------------------------------------------- | --------------------------------------------------- | :----------------: |
| [`prefer-debounce`](docs/rules/prefer-debounce.md) | `debounce` instead of `clearTimeout` + `setTimeout` |                    |
| [`prefer-identity`](docs/rules/prefer-identity.md) | `identity` instead of `x => x`                      |                    |
| [`prefer-noop`](docs/rules/prefer-noop.md)         | `noop` instead of `() => {}`                        |                    |

### Math

| Rule                                                   | Description                                            | Enabled in presets |
| ------------------------------------------------------ | ------------------------------------------------------ | :----------------: |
| [`prefer-clamp`](docs/rules/prefer-clamp.md)           | `clamp` instead of nested `Math.min`/`Math.max`        |         ✅         |
| [`prefer-in-range`](docs/rules/prefer-in-range.md)     | `inRange` instead of a two-sided comparison            |         ✅         |
| [`prefer-mean`](docs/rules/prefer-mean.md)             | `mean` instead of a `reduce` sum over `.length`        |         ✅         |
| [`prefer-mean-by`](docs/rules/prefer-mean-by.md)       | `meanBy` instead of averaging a property               |         ✅         |
| [`prefer-random-int`](docs/rules/prefer-random-int.md) | `randomInt` instead of `Math.floor(Math.random() * n)` |         ✅         |
| [`prefer-range`](docs/rules/prefer-range.md)           | `range` instead of building an index array             |         ✅         |
| [`prefer-round`](docs/rules/prefer-round.md)           | `round` instead of `Math.round(x * 100) / 100`         |         ✅         |
| [`prefer-sum`](docs/rules/prefer-sum.md)               | `sum` instead of a `reduce` sum                        |         ✅         |
| [`prefer-sum-by`](docs/rules/prefer-sum-by.md)         | `sumBy` instead of summing a property                  |         ✅         |

### Object

| Rule                                                   | Description                                        | Enabled in presets |
| ------------------------------------------------------ | -------------------------------------------------- | :----------------: |
| [`prefer-clone-deep`](docs/rules/prefer-clone-deep.md) | `cloneDeep` instead of a `JSON` round-trip         |                    |
| [`prefer-find-key`](docs/rules/prefer-find-key.md)     | `findKey` instead of `Object.keys(o).find(…)`      |         ✅         |
| [`prefer-invert`](docs/rules/prefer-invert.md)         | `invert` instead of swapping entries               |         ✅         |
| [`prefer-map-keys`](docs/rules/prefer-map-keys.md)     | `mapKeys` instead of mapping entry keys            |         ✅         |
| [`prefer-map-values`](docs/rules/prefer-map-values.md) | `mapValues` instead of mapping entry values        |         ✅         |
| [`prefer-omit-by`](docs/rules/prefer-omit-by.md)       | `omitBy` / `omit` instead of filtering entries out |         ✅         |
| [`prefer-pick-by`](docs/rules/prefer-pick-by.md)       | `pickBy` / `pick` instead of filtering entries     |         ✅         |

### Predicate

| Rule                                                             | Description                                                              | Enabled in presets |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ | :----------------: |
| [`prefer-is-array-buffer`](docs/rules/prefer-is-array-buffer.md) | `isArrayBuffer` instead of `instanceof ArrayBuffer`                      |         ✅         |
| [`prefer-is-blob`](docs/rules/prefer-is-blob.md)                 | `isBlob` instead of `instanceof Blob`                                    |         ✅         |
| [`prefer-is-boolean`](docs/rules/prefer-is-boolean.md)           | `isBoolean` instead of a `typeof` check                                  |         ✅         |
| [`prefer-is-browser`](docs/rules/prefer-is-browser.md)           | `isBrowser` instead of `typeof window` checks                            |         ✅         |
| [`prefer-is-date`](docs/rules/prefer-is-date.md)                 | `isDate` instead of `instanceof Date`                                    |         ✅         |
| [`prefer-is-empty`](docs/rules/prefer-is-empty.md)               | `isEmpty` (`es-toolkit/compat`) instead of `Object.keys(o).length === 0` |         ✅         |
| [`prefer-is-equal`](docs/rules/prefer-is-equal.md)               | `isEqual` instead of comparing `JSON.stringify` output                   |         ✅         |
| [`prefer-is-error`](docs/rules/prefer-is-error.md)               | `isError` instead of `instanceof Error`                                  |         ✅         |
| [`prefer-is-file`](docs/rules/prefer-is-file.md)                 | `isFile` instead of `instanceof File`                                    |         ✅         |
| [`prefer-is-function`](docs/rules/prefer-is-function.md)         | `isFunction` instead of a `typeof` check                                 |         ✅         |
| [`prefer-is-map`](docs/rules/prefer-is-map.md)                   | `isMap` instead of `instanceof Map`                                      |         ✅         |
| [`prefer-is-nil`](docs/rules/prefer-is-nil.md)                   | `isNil` instead of `x == null`                                           |         ✅         |
| [`prefer-is-not-nil`](docs/rules/prefer-is-not-nil.md)           | `isNotNil` instead of `x != null`                                        |         ✅         |
| [`prefer-is-null`](docs/rules/prefer-is-null.md)                 | `isNull` instead of `x === null`                                         |         ✅         |
| [`prefer-is-number`](docs/rules/prefer-is-number.md)             | `isNumber` instead of a `typeof` check                                   |         ✅         |
| [`prefer-is-plain-object`](docs/rules/prefer-is-plain-object.md) | `isPlainObject` instead of a prototype or tag check                      |         ✅         |
| [`prefer-is-promise`](docs/rules/prefer-is-promise.md)           | `isPromise` instead of `instanceof Promise`                              |         ✅         |
| [`prefer-is-reg-exp`](docs/rules/prefer-is-reg-exp.md)           | `isRegExp` instead of `instanceof RegExp`                                |         ✅         |
| [`prefer-is-set`](docs/rules/prefer-is-set.md)                   | `isSet` instead of `instanceof Set`                                      |         ✅         |
| [`prefer-is-string`](docs/rules/prefer-is-string.md)             | `isString` instead of a `typeof` check                                   |         ✅         |
| [`prefer-is-symbol`](docs/rules/prefer-is-symbol.md)             | `isSymbol` instead of a `typeof` check                                   |         ✅         |
| [`prefer-is-typed-array`](docs/rules/prefer-is-typed-array.md)   | `isTypedArray` instead of an `ArrayBuffer.isView` check                  |         ✅         |
| [`prefer-is-undefined`](docs/rules/prefer-is-undefined.md)       | `isUndefined` instead of `x === undefined`                               |         ✅         |
| [`prefer-is-weak-map`](docs/rules/prefer-is-weak-map.md)         | `isWeakMap` instead of `instanceof WeakMap`                              |         ✅         |
| [`prefer-is-weak-set`](docs/rules/prefer-is-weak-set.md)         | `isWeakSet` instead of `instanceof WeakSet`                              |         ✅         |

### Promise

| Rule                                                       | Description                                        | Enabled in presets |
| ---------------------------------------------------------- | -------------------------------------------------- | :----------------: |
| [`prefer-delay`](docs/rules/prefer-delay.md)               | `delay` instead of `new Promise` + `setTimeout`    |         ✅         |
| [`prefer-timeout`](docs/rules/prefer-timeout.md)           | `timeout` instead of a promise rejected by a timer |         ✅         |
| [`prefer-with-timeout`](docs/rules/prefer-with-timeout.md) | `withTimeout` instead of racing against a timer    |         ✅         |

### String

| Rule                                                           | Description                                         | Enabled in presets |
| -------------------------------------------------------------- | --------------------------------------------------- | :----------------: |
| [`prefer-capitalize`](docs/rules/prefer-capitalize.md)         | `capitalize` instead of recasing by hand            |         ✅         |
| [`prefer-escape-reg-exp`](docs/rules/prefer-escape-reg-exp.md) | `escapeRegExp` instead of a `.replace` escape       |         ✅         |
| [`prefer-lower-first`](docs/rules/prefer-lower-first.md)       | `lowerFirst` instead of lower-casing the first char |         ✅         |
| [`prefer-trim`](docs/rules/prefer-trim.md)                     | `trim` instead of a `.replace` on both ends         |         ✅         |
| [`prefer-trim-end`](docs/rules/prefer-trim-end.md)             | `trimEnd` instead of a `.replace` at the end        |         ✅         |
| [`prefer-trim-start`](docs/rules/prefer-trim-start.md)         | `trimStart` instead of a `.replace` at the start    |         ✅         |
| [`prefer-upper-first`](docs/rules/prefer-upper-first.md)       | `upperFirst` instead of upper-casing the first char |         ✅         |

## More

- [Configuration](docs/configuration.md): TypeScript, single rules, rule options, ignoring
  files.
- [Method-call chains](docs/method-call-chains.md): where in a chain the `.filter` /
  `.reduce` rules report.
- Each rule's page lists what it reports, what it leaves alone, and its **Limitations**.

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
pnpm check     # format, lint, typecheck, test
```

See [AGENTS.md](AGENTS.md) for how rules are built and tested.

## License

MIT
