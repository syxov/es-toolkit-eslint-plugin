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

| Rule                                                     | Description                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| [`prefer-capitalize`](docs/rules/prefer-capitalize.md)   | Prefer `capitalize` over upper-casing the first char by hand.        |
| [`prefer-clamp`](docs/rules/prefer-clamp.md)             | Prefer `clamp` over nested `Math.min`/`Math.max`.                    |
| [`prefer-delay`](docs/rules/prefer-delay.md)             | Prefer `delay` over `new Promise` + `setTimeout`.                    |
| [`prefer-is-empty`](docs/rules/prefer-is-empty.md)       | Prefer `isEmpty` over `Object.keys(obj).length === 0`.               |
| [`prefer-is-equal`](docs/rules/prefer-is-equal.md)       | Prefer `isEqual` over comparing `JSON.stringify` output.             |
| [`prefer-last`](docs/rules/prefer-last.md)               | Prefer `last` over `arr[arr.length - 1]`.                            |
| [`prefer-random-int`](docs/rules/prefer-random-int.md)   | Prefer `randomInt` over `Math.floor(Math.random() * …)`.             |
| [`prefer-range`](docs/rules/prefer-range.md)             | Prefer `range` over manual index-array construction.                 |
| [`prefer-sample`](docs/rules/prefer-sample.md)           | Prefer `sample` over random-index array access.                      |
| [`prefer-union`](docs/rules/prefer-union.md)             | Prefer `union` over deduplicating concatenated arrays via `new Set`. |
| [`prefer-uniq`](docs/rules/prefer-uniq.md)               | Prefer `uniq` over `new Set` round-trips.                            |
| [`prefer-upper-first`](docs/rules/prefer-upper-first.md) | Prefer `upperFirst` over `s.charAt(0).toUpperCase() + s.slice(1)`.   |

## Array-method rules

| Rule                                                       | Description                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| [`prefer-compact`](docs/rules/prefer-compact.md)           | Prefer `compact` over `.filter(Boolean)`.                  |
| [`prefer-difference`](docs/rules/prefer-difference.md)     | Prefer `difference` over `a.filter(x => !b.includes(x))`.  |
| [`prefer-intersection`](docs/rules/prefer-intersection.md) | Prefer `intersection` over `a.filter(x => b.includes(x))`. |
| [`prefer-mean`](docs/rules/prefer-mean.md)                 | Prefer `mean` over a `reduce` sum divided by `.length`.    |
| [`prefer-sum`](docs/rules/prefer-sum.md)                   | Prefer `sum` over `reduce((a, b) => a + b, 0)`.            |
| [`prefer-without`](docs/rules/prefer-without.md)           | Prefer `without` over `arr.filter(x => x !== value)`.      |

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
```

## License

MIT
