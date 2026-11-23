# es-toolkit-eslint-plugin

[![npm](https://img.shields.io/npm/v/es-toolkit-eslint-plugin)](https://www.npmjs.com/package/es-toolkit-eslint-plugin)
[![CI](https://github.com/syxov/es-toolkit-eslint-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/syxov/es-toolkit-eslint-plugin/actions/workflows/ci.yml)

An ESLint plugin that actively suggests [es-toolkit](https://es-toolkit.dev) utilities in
place of verbose hand-written JS/TS.

Rules are **report-only** (no auto-fix) and lean on
[esquery](https://eslint.org/docs/latest/extend/selectors) selectors to keep detection
declarative and minimal.

> [!WARNING]
> **Early stage.** This project is at a very early stage and under active development.
> False positives are possible.
> Try it out and [file issues](https://github.com/syxov/es-toolkit-eslint-plugin/issues).

> Requires **ESLint 10** (flat config).

## Install

```sh
pnpm add -D es-toolkit-eslint-plugin
```

## Usage

```js
// eslint.config.js
import esToolkit from 'es-toolkit-eslint-plugin';

export default [
  {
    files: ['**/*.{js,ts}'],
    plugins: { 'es-toolkit': esToolkit },
    rules: {
      'es-toolkit/prefer-clamp': 'error',
    },
  },
];
```

Or extend the configs for the es-toolkit categories you use:

```js
import esToolkit from 'es-toolkit-eslint-plugin';

export default [esToolkit.configs.array, esToolkit.configs.predicate];
```

The bundled category configs are `array`, `function`, `math`, `object`, `predicate`,
`promise`, and `string`. To enable every rule, use the combined config:

```js
export default [esToolkit.configs.all];
```

In the rule tables below, ✅ marks a rule that the bundled configs enable. Rules without it
are **opt-in**: they match idioms that are often written on purpose (for example
`arr[0]`, `arr.slice(0, n)` or `() => {}`), so every bundled config, `all` included, leaves them `off`.
Enable them one by one:

```js
export default [
  esToolkit.configs.all,
  { rules: { 'es-toolkit/prefer-noop': 'error' } },
];
```

Code that readers copy, such as documentation demos and examples, may be better off without
an es-toolkit import. Leave it out with a global `ignores` entry:

```js
export default [{ ignores: ['docs/demos/**'] }, esToolkit.configs.all];
```

Rules that replace `.filter(...)` or `.reduce(...)` are intentionally conservative: by default
they report only when the matched call is outside a method-call chain. This applies to
`prefer-compact`, `prefer-difference`, `prefer-difference-by`, `prefer-difference-with`,
`prefer-intersection`, `prefer-mean`, `prefer-mean-by`, `prefer-sum`, `prefer-sum-by`, and
`prefer-without`.

Configure that policy for all chain-aware rules with plugin settings:

```js
export default [
  {
    settings: {
      'es-toolkit': {
        arrayMethods: { chainPosition: 'chain-boundaries' },
      },
    },
  },
];
```

`chainPosition` may be `always`, `chain-start`, `chain-end`, `chain-boundaries`, or
`outside-chain` (the default). An individual rule can override the global setting:

```js
{
  rules: {
    'es-toolkit/prefer-compact': ['error', { chainPosition: 'always' }],
  },
}
```

Only adjacent method calls define a chain. A standalone call is both its start and end.

## Array rules

| Rule                                                             | Description                                                                               | ✅  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | :-: |
| [`prefer-chunk`](docs/rules/prefer-chunk.md)                     | Enforce using `chunk` instead of slicing an array into fixed-size pieces by hand.         | ✅  |
| [`prefer-compact`](docs/rules/prefer-compact.md)                 | Enforce using `compact` instead of `.filter(Boolean)`.                                    | ✅  |
| [`prefer-difference`](docs/rules/prefer-difference.md)           | Enforce using `difference` instead of `a.filter(x => !b.includes(x))`.                    | ✅  |
| [`prefer-difference-by`](docs/rules/prefer-difference-by.md)     | Enforce using `differenceBy` instead of `a.filter(x => !b.some(y => y.id === x.id))`.     | ✅  |
| [`prefer-difference-with`](docs/rules/prefer-difference-with.md) | Enforce using `differenceWith` instead of `a.filter(x => !b.some(y => isEqual(x, y)))`.   | ✅  |
| [`prefer-flat-map`](docs/rules/prefer-flat-map.md)               | Enforce using `flatMap` instead of `.map(...).flat()`.                                    | ✅  |
| [`prefer-flat-map-deep`](docs/rules/prefer-flat-map-deep.md)     | Enforce using `flatMapDeep` instead of `.map(...).flat(Infinity)`.                        | ✅  |
| [`prefer-flatten`](docs/rules/prefer-flatten.md)                 | Enforce using `flatten` instead of `.flat()`.                                             | ✅  |
| [`prefer-flatten-deep`](docs/rules/prefer-flatten-deep.md)       | Enforce using `flattenDeep` instead of `.flat(Infinity)`.                                 | ✅  |
| [`prefer-head`](docs/rules/prefer-head.md)                       | Enforce using `head` instead of indexing an array with `0`.                               |     |
| [`prefer-initial`](docs/rules/prefer-initial.md)                 | Enforce using `initial` instead of `arr.slice(0, -1)`.                                    | ✅  |
| [`prefer-intersection`](docs/rules/prefer-intersection.md)       | Enforce using `intersection` instead of `a.filter(x => b.includes(x))`.                   | ✅  |
| [`prefer-is-subset`](docs/rules/prefer-is-subset.md)             | Enforce using `isSubset` instead of `subset.every(x => superset.includes(x))`.            | ✅  |
| [`prefer-key-by`](docs/rules/prefer-key-by.md)                   | Enforce using `keyBy` instead of `Object.fromEntries(xs.map(x => [key, x]))`.             | ✅  |
| [`prefer-last`](docs/rules/prefer-last.md)                       | Enforce using `last` instead of `arr[arr.length - 1]`.                                    | ✅  |
| [`prefer-sample`](docs/rules/prefer-sample.md)                   | Enforce using `sample` instead of random-index array access.                              | ✅  |
| [`prefer-shuffle`](docs/rules/prefer-shuffle.md)                 | Enforce using `shuffle` instead of sorting with a random comparator.                      | ✅  |
| [`prefer-tail`](docs/rules/prefer-tail.md)                       | Enforce using `tail` instead of `arr.slice(1)`.                                           | ✅  |
| [`prefer-take`](docs/rules/prefer-take.md)                       | Enforce using `take` instead of `arr.slice(0, n)`.                                        |     |
| [`prefer-take-right`](docs/rules/prefer-take-right.md)           | Enforce using `takeRight` instead of `arr.slice(-n)`.                                     |     |
| [`prefer-union`](docs/rules/prefer-union.md)                     | Enforce using `union` instead of deduplicating two concatenated arrays through `new Set`. | ✅  |
| [`prefer-uniq`](docs/rules/prefer-uniq.md)                       | Enforce using `uniq` instead of `new Set` round-trips.                                    | ✅  |
| [`prefer-uniq-by`](docs/rules/prefer-uniq-by.md)                 | Enforce using `uniqBy` instead of reading the values of `new Map(xs.map(x => [key, x]))`. | ✅  |
| [`prefer-without`](docs/rules/prefer-without.md)                 | Enforce using `without` instead of `arr.filter(x => x !== value)`.                        | ✅  |
| [`prefer-zip`](docs/rules/prefer-zip.md)                         | Enforce using `zip` instead of `a.map((x, i) => [x, b[i]])`.                              | ✅  |

## Function rules

| Rule                                               | Description                                                                          | ✅  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ | :-: |
| [`prefer-debounce`](docs/rules/prefer-debounce.md) | Enforce using `debounce` instead of a hand-written `clearTimeout`/`setTimeout` pair. |     |
| [`prefer-identity`](docs/rules/prefer-identity.md) | Enforce using `identity` instead of an inline `x => x` function.                     |     |
| [`prefer-noop`](docs/rules/prefer-noop.md)         | Enforce using `noop` instead of an inline `() => {}` function.                       |     |

## Math rules

| Rule                                                   | Description                                                                             | ✅  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | :-: |
| [`prefer-clamp`](docs/rules/prefer-clamp.md)           | Enforce using `clamp` instead of nested `Math.min`/`Math.max`.                          | ✅  |
| [`prefer-in-range`](docs/rules/prefer-in-range.md)     | Enforce using `inRange` instead of range checks with literal bounds.                    | ✅  |
| [`prefer-mean`](docs/rules/prefer-mean.md)             | Enforce using `mean` instead of a `reduce` sum divided by `.length`.                    | ✅  |
| [`prefer-mean-by`](docs/rules/prefer-mean-by.md)       | Enforce using `meanBy` instead of averaging an item property with `reduce`.             | ✅  |
| [`prefer-random-int`](docs/rules/prefer-random-int.md) | Enforce using `randomInt` instead of `Math.floor(Math.random() * …)`.                   | ✅  |
| [`prefer-range`](docs/rules/prefer-range.md)           | Enforce using `range` instead of manual index-array construction.                       | ✅  |
| [`prefer-round`](docs/rules/prefer-round.md)           | Enforce using `round` instead of `Math.round(x * 100) / 100` (any power-of-ten factor). | ✅  |
| [`prefer-sum`](docs/rules/prefer-sum.md)               | Enforce using `sum` instead of `reduce((a, b) => a + b, 0)`.                            | ✅  |
| [`prefer-sum-by`](docs/rules/prefer-sum-by.md)         | Enforce using `sumBy` instead of summing an item property with `reduce`.                | ✅  |

## Object rules

| Rule                                                   | Description                                                                                              | ✅  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | :-: |
| [`prefer-clone-deep`](docs/rules/prefer-clone-deep.md) | Enforce using `cloneDeep` instead of `JSON.parse(JSON.stringify(x))`.                                    |     |
| [`prefer-map-values`](docs/rules/prefer-map-values.md) | Enforce using `mapValues` instead of `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))`. | ✅  |

## Predicate rules

| Rule                                                             | Description                                                                                                         | ✅  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | :-: |
| [`prefer-is-array-buffer`](docs/rules/prefer-is-array-buffer.md) | Enforce using `isArrayBuffer` instead of `instanceof ArrayBuffer`.                                                  | ✅  |
| [`prefer-is-blob`](docs/rules/prefer-is-blob.md)                 | Enforce using `isBlob` instead of `value instanceof Blob`.                                                          | ✅  |
| [`prefer-is-boolean`](docs/rules/prefer-is-boolean.md)           | Enforce using `isBoolean` instead of a `typeof` boolean check.                                                      | ✅  |
| [`prefer-is-date`](docs/rules/prefer-is-date.md)                 | Enforce using `isDate` instead of `value instanceof Date`.                                                          | ✅  |
| [`prefer-is-empty`](docs/rules/prefer-is-empty.md)               | Enforce using `isEmpty` from `es-toolkit/compat` instead of comparing `Object.keys(obj).length` with `0`.           | ✅  |
| [`prefer-is-equal`](docs/rules/prefer-is-equal.md)               | Enforce using `isEqual` instead of comparing `JSON.stringify` output.                                               | ✅  |
| [`prefer-is-error`](docs/rules/prefer-is-error.md)               | Enforce using `isError` instead of `value instanceof Error`.                                                        | ✅  |
| [`prefer-is-file`](docs/rules/prefer-is-file.md)                 | Enforce using `isFile` instead of `value instanceof File`.                                                          | ✅  |
| [`prefer-is-function`](docs/rules/prefer-is-function.md)         | Enforce using `isFunction` instead of a `typeof` function check.                                                    | ✅  |
| [`prefer-is-map`](docs/rules/prefer-is-map.md)                   | Enforce using `isMap` instead of `value instanceof Map`.                                                            | ✅  |
| [`prefer-is-nil`](docs/rules/prefer-is-nil.md)                   | Enforce using `isNil` instead of `value == null` or `value === null \|\| value === undefined`.                      | ✅  |
| [`prefer-is-not-nil`](docs/rules/prefer-is-not-nil.md)           | Enforce using `isNotNil` instead of `value != null` or `value !== null && value !== undefined`.                     | ✅  |
| [`prefer-is-null`](docs/rules/prefer-is-null.md)                 | Enforce using `isNull` instead of `value === null` or `value !== null`.                                             | ✅  |
| [`prefer-is-number`](docs/rules/prefer-is-number.md)             | Enforce using `isNumber` instead of a `typeof` number check.                                                        | ✅  |
| [`prefer-is-reg-exp`](docs/rules/prefer-is-reg-exp.md)           | Enforce using `isRegExp` instead of `value instanceof RegExp`.                                                      | ✅  |
| [`prefer-is-set`](docs/rules/prefer-is-set.md)                   | Enforce using `isSet` instead of `value instanceof Set`.                                                            | ✅  |
| [`prefer-is-string`](docs/rules/prefer-is-string.md)             | Enforce using `isString` instead of a `typeof` string check.                                                        | ✅  |
| [`prefer-is-symbol`](docs/rules/prefer-is-symbol.md)             | Enforce using `isSymbol` instead of a `typeof` symbol check.                                                        | ✅  |
| [`prefer-is-typed-array`](docs/rules/prefer-is-typed-array.md)   | Enforce using `isTypedArray` instead of an ArrayBuffer view check.                                                  | ✅  |
| [`prefer-is-undefined`](docs/rules/prefer-is-undefined.md)       | Enforce using `isUndefined` instead of `value === undefined`, `value === void 0` or `typeof value === "undefined"`. | ✅  |
| [`prefer-is-weak-map`](docs/rules/prefer-is-weak-map.md)         | Enforce using `isWeakMap` instead of `value instanceof WeakMap`.                                                    | ✅  |
| [`prefer-is-weak-set`](docs/rules/prefer-is-weak-set.md)         | Enforce using `isWeakSet` instead of `value instanceof WeakSet`.                                                    | ✅  |

## Promise rules

| Rule                                                       | Description                                                                        | ✅  |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | :-: |
| [`prefer-delay`](docs/rules/prefer-delay.md)               | Enforce using `delay` instead of `new Promise` + `setTimeout`.                     | ✅  |
| [`prefer-timeout`](docs/rules/prefer-timeout.md)           | Enforce using `timeout` instead of a `new Promise` that rejects from `setTimeout`. | ✅  |
| [`prefer-with-timeout`](docs/rules/prefer-with-timeout.md) | Enforce using `withTimeout` instead of racing a promise against a rejecting timer. | ✅  |

## String rules

| Rule                                                           | Description                                                                          | ✅  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | :-: |
| [`prefer-capitalize`](docs/rules/prefer-capitalize.md)         | Enforce using `capitalize` instead of upper-casing the first char by hand.           | ✅  |
| [`prefer-escape-reg-exp`](docs/rules/prefer-escape-reg-exp.md) | Enforce using `escapeRegExp` instead of escaping regex specials with `.replace`.     | ✅  |
| [`prefer-lower-first`](docs/rules/prefer-lower-first.md)       | Enforce using `lowerFirst` instead of lower-casing the first char by hand.           | ✅  |
| [`prefer-trim`](docs/rules/prefer-trim.md)                     | Enforce using `trim` instead of stripping characters from both ends with `.replace`. | ✅  |
| [`prefer-trim-end`](docs/rules/prefer-trim-end.md)             | Enforce using `trimEnd` instead of stripping trailing characters with `.replace`.    | ✅  |
| [`prefer-trim-start`](docs/rules/prefer-trim-start.md)         | Enforce using `trimStart` instead of stripping leading characters with `.replace`.   | ✅  |
| [`prefer-upper-first`](docs/rules/prefer-upper-first.md)       | Enforce using `upperFirst` instead of upper-casing the first char by hand.           | ✅  |

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
```

## License

MIT
