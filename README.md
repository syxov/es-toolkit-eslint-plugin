# es-toolkit-eslint-plugin

An ESLint plugin that actively suggests [es-toolkit](https://es-toolkit.dev) utilities in
place of verbose hand-written JS/TS.

Rules are **report-only** (no auto-fix) and lean on
[esquery](https://eslint.org/docs/latest/extend/selectors) selectors to keep detection
declarative and minimal.

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
      'es-toolkit/prefer-clamp': 'warn',
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

| Rule | Description | Fixable |
| --- | --- | --- |
| [`prefer-clamp`](docs/rules/prefer-clamp.md) | Prefer `clamp` over nested `Math.min`/`Math.max`. | — |

## Roadmap

More `prefer-*` rules mapping common idioms to es-toolkit utilities (e.g. `prefer-uniq`,
`prefer-group-by`, `prefer-debounce`). New rules reuse the shared `createRule` factory
(`src/utils/create-rule.ts`) and the same esquery-driven detection style.

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
```

## License

MIT
