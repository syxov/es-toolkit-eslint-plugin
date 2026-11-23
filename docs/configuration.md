# Configuration

## TypeScript

The rules work on syntax only and do not need type information, but ESLint needs a parser
for TypeScript files. With [typescript-eslint](https://typescript-eslint.io/getting-started):

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import esToolkit from 'es-toolkit-eslint-plugin';

export default defineConfig([
  esToolkit.configs.all,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: { parser: tseslint.parser },
  },
]);
```

A config that already extends `tseslint.configs.recommended` (or another typescript-eslint
config) has the parser set; add `esToolkit.configs.all` to it.

## Single rules without a preset

```js
export default defineConfig([
  {
    plugins: { 'es-toolkit': esToolkit },
    rules: { 'es-toolkit/prefer-clamp': 'error' },
  },
]);
```

## Method-call chains

Rules that replace `.filter(...)` or `.reduce(...)` report by default only a call outside a
method-call chain. See [Method-call chains](method-call-chains.md) for the setting that
changes this.

## Rule options

[`prefer-is-browser`](rules/prefer-is-browser.md#options) and
[`prefer-without`](rules/prefer-without.md#options) take an option; the other rules have
none.

## Ignoring files

Code that readers copy, such as documentation demos, may be better off without an es-toolkit
import. Leave it out with a global `ignores` entry:

```js
export default defineConfig([
  { ignores: ['docs/demos/**'] },
  esToolkit.configs.all,
]);
```
