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

Or extend the bundled config:

```js
import esToolkit from 'es-toolkit-eslint-plugin';

export default [esToolkit.configs.recommended];
```

## Rules

| Rule                                                       | Description                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| [`prefer-capitalize`](docs/rules/prefer-capitalize.md)     | Prefer `capitalize` over upper-casing the first char by hand.        |
| [`prefer-clamp`](docs/rules/prefer-clamp.md)               | Prefer `clamp` over nested `Math.min`/`Math.max`.                    |
| [`prefer-compact`](docs/rules/prefer-compact.md)           | Prefer `compact` over `.filter(Boolean)`.                            |
| [`prefer-delay`](docs/rules/prefer-delay.md)               | Prefer `delay` over `new Promise` + `setTimeout`.                    |
| [`prefer-difference`](docs/rules/prefer-difference.md)     | Prefer `difference` over `a.filter(x => !b.includes(x))`.            |
| [`prefer-intersection`](docs/rules/prefer-intersection.md) | Prefer `intersection` over `a.filter(x => b.includes(x))`.           |
| [`prefer-is-empty`](docs/rules/prefer-is-empty.md)         | Prefer `isEmpty` over `Object.keys(obj).length === 0`.               |
| [`prefer-is-equal`](docs/rules/prefer-is-equal.md)         | Prefer `isEqual` over comparing `JSON.stringify` output.             |
| [`prefer-last`](docs/rules/prefer-last.md)                 | Prefer `last` over `arr[arr.length - 1]`.                            |
| [`prefer-mean`](docs/rules/prefer-mean.md)                 | Prefer `mean` over a `reduce` sum divided by `.length`.              |
| [`prefer-random-int`](docs/rules/prefer-random-int.md)     | Prefer `randomInt` over `Math.floor(Math.random() * …)`.             |
| [`prefer-range`](docs/rules/prefer-range.md)               | Prefer `range` over manual index-array construction.                 |
| [`prefer-sample`](docs/rules/prefer-sample.md)             | Prefer `sample` over random-index array access.                      |
| [`prefer-sum`](docs/rules/prefer-sum.md)                   | Prefer `sum` over `reduce((a, b) => a + b, 0)`.                      |
| [`prefer-union`](docs/rules/prefer-union.md)               | Prefer `union` over deduplicating concatenated arrays via `new Set`. |
| [`prefer-uniq`](docs/rules/prefer-uniq.md)                 | Prefer `uniq` over `new Set` round-trips.                            |
| [`prefer-upper-first`](docs/rules/prefer-upper-first.md)   | Prefer `upperFirst` over `s.charAt(0).toUpperCase() + s.slice(1)`.   |
| [`prefer-without`](docs/rules/prefer-without.md)           | Prefer `without` over `arr.filter(x => x !== value)`.                |

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
```

## License

MIT
