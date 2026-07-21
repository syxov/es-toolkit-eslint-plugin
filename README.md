# es-toolkit-eslint-plugin

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

Or extend either bundled config:

```js
import esToolkit from 'es-toolkit-eslint-plugin';

export default [
  esToolkit.configs.utilities,
  esToolkit.configs['array-methods'],
];
```

`utilities` contains rules for non-array idioms. `array-methods` contains rules that replace
`.filter(...)` or `.reduce(...)` and is intentionally conservative: by default it reports only
when the matched call is outside a method-call chain.

Configure that policy for all array-method rules with plugin settings:

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

## Utility rules

| Rule                                                             | Description                                                          |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`prefer-capitalize`](docs/rules/prefer-capitalize.md)           | Prefer `capitalize` over upper-casing the first char by hand.        |
| [`prefer-clamp`](docs/rules/prefer-clamp.md)                     | Prefer `clamp` over nested `Math.min`/`Math.max`.                    |
| [`prefer-delay`](docs/rules/prefer-delay.md)                     | Prefer `delay` over `new Promise` + `setTimeout`.                    |
| [`prefer-is-date`](docs/rules/prefer-is-date.md)                 | Prefer `isDate` over `value instanceof Date`.                        |
| [`prefer-flat-map`](docs/rules/prefer-flat-map.md)               | Prefer `flatMap` over `.map(...).flat()`.                            |
| [`prefer-flat-map-deep`](docs/rules/prefer-flat-map-deep.md)     | Prefer `flatMapDeep` over `.map(...).flat(Infinity)`.                |
| [`prefer-flatten`](docs/rules/prefer-flatten.md)                 | Prefer `flatten` over `.flat()`.                                     |
| [`prefer-flatten-deep`](docs/rules/prefer-flatten-deep.md)       | Prefer `flattenDeep` over `.flat(Infinity)`.                         |
| [`prefer-head`](docs/rules/prefer-head.md)                       | Prefer `head` over indexing an array with `0`.                       |
| [`prefer-is-empty`](docs/rules/prefer-is-empty.md)               | Prefer `isEmpty` over `Object.keys(obj).length === 0`.               |
| [`prefer-is-equal`](docs/rules/prefer-is-equal.md)               | Prefer `isEqual` over comparing `JSON.stringify` output.             |
| [`prefer-is-error`](docs/rules/prefer-is-error.md)               | Prefer `isError` over `value instanceof Error`.                      |
| [`prefer-is-function`](docs/rules/prefer-is-function.md)         | Prefer `isFunction` over a `typeof` function check.                  |
| [`prefer-is-map`](docs/rules/prefer-is-map.md)                   | Prefer `isMap` over `value instanceof Map`.                          |
| [`prefer-is-boolean`](docs/rules/prefer-is-boolean.md)           | Prefer `isBoolean` over a `typeof` boolean check.                    |
| [`prefer-is-blob`](docs/rules/prefer-is-blob.md)                 | Prefer `isBlob` over `value instanceof Blob`.                        |
| [`prefer-is-file`](docs/rules/prefer-is-file.md)                 | Prefer `isFile` over `value instanceof File`.                        |
| [`prefer-is-array-buffer`](docs/rules/prefer-is-array-buffer.md) | Prefer `isArrayBuffer` over `value instanceof ArrayBuffer`.          |
| [`prefer-is-nil`](docs/rules/prefer-is-nil.md)                   | Prefer `isNil` over `value == null`.                                 |
| [`prefer-is-not-nil`](docs/rules/prefer-is-not-nil.md)           | Prefer `isNotNil` over `value != null`.                              |
| [`prefer-is-null`](docs/rules/prefer-is-null.md)                 | Prefer `isNull` over `value === null`.                               |
| [`prefer-is-number`](docs/rules/prefer-is-number.md)             | Prefer `isNumber` over a `typeof` number check.                      |
| [`prefer-is-reg-exp`](docs/rules/prefer-is-reg-exp.md)           | Prefer `isRegExp` over `value instanceof RegExp`.                    |
| [`prefer-is-set`](docs/rules/prefer-is-set.md)                   | Prefer `isSet` over `value instanceof Set`.                          |
| [`prefer-is-string`](docs/rules/prefer-is-string.md)             | Prefer `isString` over a `typeof` string check.                      |
| [`prefer-is-symbol`](docs/rules/prefer-is-symbol.md)             | Prefer `isSymbol` over a `typeof` symbol check.                      |
| [`prefer-is-typed-array`](docs/rules/prefer-is-typed-array.md)   | Prefer `isTypedArray` over a manual ArrayBuffer view check.          |
| [`prefer-is-undefined`](docs/rules/prefer-is-undefined.md)       | Prefer `isUndefined` over `value === undefined`.                     |
| [`prefer-is-weak-map`](docs/rules/prefer-is-weak-map.md)         | Prefer `isWeakMap` over `value instanceof WeakMap`.                  |
| [`prefer-is-weak-set`](docs/rules/prefer-is-weak-set.md)         | Prefer `isWeakSet` over `value instanceof WeakSet`.                  |
| [`prefer-initial`](docs/rules/prefer-initial.md)                 | Prefer `initial` over `arr.slice(0, -1)`.                            |
| [`prefer-in-range`](docs/rules/prefer-in-range.md)               | Prefer `inRange` over manual range-bound checks.                     |
| [`prefer-last`](docs/rules/prefer-last.md)                       | Prefer `last` over `arr[arr.length - 1]`.                            |
| [`prefer-lower-first`](docs/rules/prefer-lower-first.md)         | Prefer `lowerFirst` over lower-casing the first char by hand.        |
| [`prefer-random-int`](docs/rules/prefer-random-int.md)           | Prefer `randomInt` over `Math.floor(Math.random() * …)`.             |
| [`prefer-range`](docs/rules/prefer-range.md)                     | Prefer `range` over manual index-array construction.                 |
| [`prefer-sample`](docs/rules/prefer-sample.md)                   | Prefer `sample` over random-index array access.                      |
| [`prefer-tail`](docs/rules/prefer-tail.md)                       | Prefer `tail` over `arr.slice(1)`.                                   |
| [`prefer-union`](docs/rules/prefer-union.md)                     | Prefer `union` over deduplicating concatenated arrays via `new Set`. |
| [`prefer-uniq`](docs/rules/prefer-uniq.md)                       | Prefer `uniq` over `new Set` round-trips.                            |
| [`prefer-upper-first`](docs/rules/prefer-upper-first.md)         | Prefer `upperFirst` over `s.charAt(0).toUpperCase() + s.slice(1)`.   |

## Array-method rules

| Rule                                                       | Description                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| [`prefer-compact`](docs/rules/prefer-compact.md)           | Prefer `compact` over `.filter(Boolean)`.                      |
| [`prefer-difference`](docs/rules/prefer-difference.md)     | Prefer `difference` over `a.filter(x => !b.includes(x))`.      |
| [`prefer-intersection`](docs/rules/prefer-intersection.md) | Prefer `intersection` over `a.filter(x => b.includes(x))`.     |
| [`prefer-mean`](docs/rules/prefer-mean.md)                 | Prefer `mean` over a `reduce` sum divided by `.length`.        |
| [`prefer-mean-by`](docs/rules/prefer-mean-by.md)           | Prefer `meanBy` over averaging an item property with `reduce`. |
| [`prefer-sum`](docs/rules/prefer-sum.md)                   | Prefer `sum` over `reduce((a, b) => a + b, 0)`.                |
| [`prefer-sum-by`](docs/rules/prefer-sum-by.md)             | Prefer `sumBy` over summing an item property with `reduce`.    |
| [`prefer-without`](docs/rules/prefer-without.md)           | Prefer `without` over `arr.filter(x => x !== value)`.          |

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
```

## License

MIT
