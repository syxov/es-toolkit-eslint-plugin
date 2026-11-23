# es-toolkit-eslint-plugin

[![npm](https://img.shields.io/npm/v/es-toolkit-eslint-plugin)](https://www.npmjs.com/package/es-toolkit-eslint-plugin)
[![CI](https://github.com/syxov/es-toolkit-eslint-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/syxov/es-toolkit-eslint-plugin/actions/workflows/ci.yml)

An ESLint plugin that finds hand-written JS/TS which an [es-toolkit](https://es-toolkit.dev)
utility already covers, and tells you which utility to use.

## Example

```js
// volume.js
export function setVolume(level) {
  return Math.min(Math.max(level, 0), 100);
}
```

```text
$ npx eslint volume.js

volume.js
  2:10  error  Prefer `clamp` from es-toolkit instead of nesting `Math.min`/`Math.max`  es-toolkit/prefer-clamp
```

```js
// volume.js, rewritten by hand
import { clamp } from 'es-toolkit';

export function setVolume(level) {
  return clamp(level, 0, 100);
}
```

The plugin **only reports**. It has no auto-fix and no editor suggestions: you write the
replacement and the import yourself, after checking that the utility behaves the same for
your inputs (see [Before you apply a suggestion](#before-you-apply-a-suggestion)).

## Requirements and status

- **ESLint 10** with flat config (`eslint.config.js`). Legacy `.eslintrc` is not supported.
- **JavaScript** works as is. **TypeScript** needs a TypeScript parser, see
  [TypeScript](#typescript). Rules do not use type information, so no `tsconfig` setup is
  required.
- **es-toolkit** is not a dependency of the plugin and is not needed to run it. Add it to
  your project when you start applying the suggestions.

> [!WARNING]
> **Early stage.** The plugin is under active development and false positives are possible.
> Please [file issues](https://github.com/syxov/es-toolkit-eslint-plugin/issues).

## Install

```sh
pnpm add -D es-toolkit-eslint-plugin
# and, once you adopt the suggestions:
pnpm add es-toolkit
```

## Quick start

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import esToolkit from 'es-toolkit-eslint-plugin';

export default defineConfig([esToolkit.configs.all]);
```

```sh
npx eslint .
```

`configs.all` turns on every rule that is on by default. The
[opt-in rules](#presets-and-opt-in-rules) stay off even there.

### TypeScript

Point ESLint at your TypeScript files and give them a parser. With
[typescript-eslint](https://typescript-eslint.io/getting-started) (`pnpm add -D typescript-eslint`):

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

If your config already extends a typescript-eslint config such as
`tseslint.configs.recommended`, the parser is set; just add `esToolkit.configs.all`.

## Presets and opt-in rules

| Preset                                                                          | Enables                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `configs.all`                                                                   | Every rule marked ✅ in the [catalog](#rules), in all categories. Opt-in rules stay off. |
| `configs.array`, `function`, `math`, `object`, `predicate`, `promise`, `string` | The ✅ rules of that es-toolkit category only.                                           |

```js
export default defineConfig([
  esToolkit.configs.array,
  esToolkit.configs.predicate,
]);
```

**Opt-in rules** match idioms that are often written on purpose, such as `arr[0]`,
`arr.slice(0, n)` or `() => {}`, so no preset enables them: `prefer-clone-deep`,
`prefer-debounce`, `prefer-head`, `prefer-identity`, `prefer-noop`, `prefer-take`, and
`prefer-take-right`. Turn them on one by one:

```js
export default defineConfig([
  esToolkit.configs.all,
  { rules: { 'es-toolkit/prefer-noop': 'error' } },
]);
```

To use single rules without a preset, register the plugin yourself:

```js
export default defineConfig([
  {
    plugins: { 'es-toolkit': esToolkit },
    rules: { 'es-toolkit/prefer-clamp': 'error' },
  },
]);
```

## Rules

Each rule's page has examples of what is and is not reported, and its limitations.

### Array

| Rule                                                             | Replaces                                                        | Enabled in presets |
| ---------------------------------------------------------------- | --------------------------------------------------------------- | :----------------: |
| [`prefer-chunk`](docs/rules/prefer-chunk.md)                     | a loop pushing `xs.slice(i, i + n)` → `chunk`                   |         ✅         |
| [`prefer-compact`](docs/rules/prefer-compact.md)                 | `.filter(Boolean)` → `compact`                                  |         ✅         |
| [`prefer-difference`](docs/rules/prefer-difference.md)           | `a.filter(x => !b.includes(x))` → `difference`                  |         ✅         |
| [`prefer-difference-by`](docs/rules/prefer-difference-by.md)     | `a.filter(x => !b.some(y => y.id === x.id))` → `differenceBy`   |         ✅         |
| [`prefer-difference-with`](docs/rules/prefer-difference-with.md) | `a.filter(x => !b.some(y => isEqual(x, y)))` → `differenceWith` |         ✅         |
| [`prefer-flat-map`](docs/rules/prefer-flat-map.md)               | `.map(f).flat()` → `flatMap`                                    |         ✅         |
| [`prefer-flat-map-deep`](docs/rules/prefer-flat-map-deep.md)     | `.map(f).flat(Infinity)` → `flatMapDeep`                        |         ✅         |
| [`prefer-flatten`](docs/rules/prefer-flatten.md)                 | `.flat()` → `flatten`                                           |         ✅         |
| [`prefer-flatten-deep`](docs/rules/prefer-flatten-deep.md)       | `.flat(Infinity)` → `flattenDeep`                               |         ✅         |
| [`prefer-head`](docs/rules/prefer-head.md)                       | `arr[0]` → `head`                                               |                    |
| [`prefer-initial`](docs/rules/prefer-initial.md)                 | `arr.slice(0, -1)` → `initial`                                  |         ✅         |
| [`prefer-intersection`](docs/rules/prefer-intersection.md)       | `a.filter(x => b.includes(x))` → `intersection`                 |         ✅         |
| [`prefer-is-subset`](docs/rules/prefer-is-subset.md)             | `sub.every(x => sup.includes(x))` → `isSubset`                  |         ✅         |
| [`prefer-key-by`](docs/rules/prefer-key-by.md)                   | `Object.fromEntries(xs.map(x => [x.id, x]))` → `keyBy`          |         ✅         |
| [`prefer-last`](docs/rules/prefer-last.md)                       | `arr[arr.length - 1]` → `last`                                  |         ✅         |
| [`prefer-sample`](docs/rules/prefer-sample.md)                   | `arr[Math.floor(Math.random() * arr.length)]` → `sample`        |         ✅         |
| [`prefer-shuffle`](docs/rules/prefer-shuffle.md)                 | `arr.sort(() => Math.random() - 0.5)` → `shuffle`               |         ✅         |
| [`prefer-tail`](docs/rules/prefer-tail.md)                       | `arr.slice(1)` → `tail`                                         |         ✅         |
| [`prefer-take`](docs/rules/prefer-take.md)                       | `arr.slice(0, n)` → `take`                                      |                    |
| [`prefer-take-right`](docs/rules/prefer-take-right.md)           | `arr.slice(-n)` → `takeRight`                                   |                    |
| [`prefer-union`](docs/rules/prefer-union.md)                     | `[...new Set([...a, ...b])]` → `union`                          |         ✅         |
| [`prefer-uniq`](docs/rules/prefer-uniq.md)                       | `[...new Set(arr)]` → `uniq`                                    |         ✅         |
| [`prefer-uniq-by`](docs/rules/prefer-uniq-by.md)                 | `[...new Map(xs.map(x => [x.id, x])).values()]` → `uniqBy`      |         ✅         |
| [`prefer-without`](docs/rules/prefer-without.md)                 | `arr.filter(x => x !== value)` → `without`                      |         ✅         |
| [`prefer-zip`](docs/rules/prefer-zip.md)                         | `a.map((x, i) => [x, b[i]])` → `zip`                            |         ✅         |

### Function

| Rule                                               | Replaces                                        | Enabled in presets |
| -------------------------------------------------- | ----------------------------------------------- | :----------------: |
| [`prefer-debounce`](docs/rules/prefer-debounce.md) | a `clearTimeout`/`setTimeout` pair → `debounce` |                    |
| [`prefer-identity`](docs/rules/prefer-identity.md) | `x => x` → `identity`                           |                    |
| [`prefer-noop`](docs/rules/prefer-noop.md)         | `() => {}` → `noop`                             |                    |

### Math

| Rule                                                   | Replaces                                             | Enabled in presets |
| ------------------------------------------------------ | ---------------------------------------------------- | :----------------: |
| [`prefer-clamp`](docs/rules/prefer-clamp.md)           | `Math.min(Math.max(x, lo), hi)` → `clamp`            |         ✅         |
| [`prefer-in-range`](docs/rules/prefer-in-range.md)     | `x >= 200 && x < 300` → `inRange`                    |         ✅         |
| [`prefer-mean`](docs/rules/prefer-mean.md)             | `xs.reduce((a, b) => a + b, 0) / xs.length` → `mean` |         ✅         |
| [`prefer-mean-by`](docs/rules/prefer-mean-by.md)       | averaging `item.price` with `reduce` → `meanBy`      |         ✅         |
| [`prefer-random-int`](docs/rules/prefer-random-int.md) | `Math.floor(Math.random() * n)` → `randomInt`        |         ✅         |
| [`prefer-range`](docs/rules/prefer-range.md)           | `Array.from({ length: n }, (_, i) => i)` → `range`   |         ✅         |
| [`prefer-round`](docs/rules/prefer-round.md)           | `Math.round(x * 100) / 100` → `round`                |         ✅         |
| [`prefer-sum`](docs/rules/prefer-sum.md)               | `xs.reduce((a, b) => a + b, 0)` → `sum`              |         ✅         |
| [`prefer-sum-by`](docs/rules/prefer-sum-by.md)         | `xs.reduce((acc, x) => acc + x.price, 0)` → `sumBy`  |         ✅         |

### Object

| Rule                                                   | Replaces                                                                                       | Enabled in presets |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | :----------------: |
| [`prefer-clone-deep`](docs/rules/prefer-clone-deep.md) | `JSON.parse(JSON.stringify(x))` → `cloneDeep`                                                  |                    |
| [`prefer-find-key`](docs/rules/prefer-find-key.md)     | `Object.keys(o).find(k => pred(o[k]))` → `findKey`                                             |         ✅         |
| [`prefer-invert`](docs/rules/prefer-invert.md)         | `Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]))` → `invert`                     |         ✅         |
| [`prefer-map-keys`](docs/rules/prefer-map-keys.md)     | `Object.fromEntries(Object.entries(o).map(([k, v]) => [f(k), v]))` → `mapKeys`                 |         ✅         |
| [`prefer-map-values`](docs/rules/prefer-map-values.md) | `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))` → `mapValues`               |         ✅         |
| [`prefer-omit-by`](docs/rules/prefer-omit-by.md)       | `Object.fromEntries(Object.entries(o).filter(…))` with a negated predicate → `omitBy` / `omit` |         ✅         |
| [`prefer-pick-by`](docs/rules/prefer-pick-by.md)       | `Object.fromEntries(Object.entries(o).filter(…))` → `pickBy` / `pick`                          |         ✅         |

### Predicate

| Rule                                                             | Replaces                                                             | Enabled in presets |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | :----------------: |
| [`prefer-is-array-buffer`](docs/rules/prefer-is-array-buffer.md) | `x instanceof ArrayBuffer` → `isArrayBuffer`                         |         ✅         |
| [`prefer-is-blob`](docs/rules/prefer-is-blob.md)                 | `x instanceof Blob` → `isBlob`                                       |         ✅         |
| [`prefer-is-boolean`](docs/rules/prefer-is-boolean.md)           | `typeof x === 'boolean'` → `isBoolean`                               |         ✅         |
| [`prefer-is-browser`](docs/rules/prefer-is-browser.md)           | `typeof window !== 'undefined'` → `isBrowser`                        |         ✅         |
| [`prefer-is-date`](docs/rules/prefer-is-date.md)                 | `x instanceof Date` → `isDate`                                       |         ✅         |
| [`prefer-is-empty`](docs/rules/prefer-is-empty.md)               | `Object.keys(o).length === 0` → `isEmpty` from `es-toolkit/compat`   |         ✅         |
| [`prefer-is-equal`](docs/rules/prefer-is-equal.md)               | `JSON.stringify(a) === JSON.stringify(b)` → `isEqual`                |         ✅         |
| [`prefer-is-error`](docs/rules/prefer-is-error.md)               | `x instanceof Error` → `isError`                                     |         ✅         |
| [`prefer-is-file`](docs/rules/prefer-is-file.md)                 | `x instanceof File` → `isFile`                                       |         ✅         |
| [`prefer-is-function`](docs/rules/prefer-is-function.md)         | `typeof x === 'function'` → `isFunction`                             |         ✅         |
| [`prefer-is-map`](docs/rules/prefer-is-map.md)                   | `x instanceof Map` → `isMap`                                         |         ✅         |
| [`prefer-is-nil`](docs/rules/prefer-is-nil.md)                   | `x == null` → `isNil`                                                |         ✅         |
| [`prefer-is-not-nil`](docs/rules/prefer-is-not-nil.md)           | `x != null` → `isNotNil`                                             |         ✅         |
| [`prefer-is-null`](docs/rules/prefer-is-null.md)                 | `x === null` → `isNull`                                              |         ✅         |
| [`prefer-is-number`](docs/rules/prefer-is-number.md)             | `typeof x === 'number'` → `isNumber`                                 |         ✅         |
| [`prefer-is-plain-object`](docs/rules/prefer-is-plain-object.md) | `Object.getPrototypeOf(x) === Object.prototype` → `isPlainObject`    |         ✅         |
| [`prefer-is-promise`](docs/rules/prefer-is-promise.md)           | `x instanceof Promise` → `isPromise`                                 |         ✅         |
| [`prefer-is-reg-exp`](docs/rules/prefer-is-reg-exp.md)           | `x instanceof RegExp` → `isRegExp`                                   |         ✅         |
| [`prefer-is-set`](docs/rules/prefer-is-set.md)                   | `x instanceof Set` → `isSet`                                         |         ✅         |
| [`prefer-is-string`](docs/rules/prefer-is-string.md)             | `typeof x === 'string'` → `isString`                                 |         ✅         |
| [`prefer-is-symbol`](docs/rules/prefer-is-symbol.md)             | `typeof x === 'symbol'` → `isSymbol`                                 |         ✅         |
| [`prefer-is-typed-array`](docs/rules/prefer-is-typed-array.md)   | `ArrayBuffer.isView(x) && !(x instanceof DataView)` → `isTypedArray` |         ✅         |
| [`prefer-is-undefined`](docs/rules/prefer-is-undefined.md)       | `x === undefined` → `isUndefined`                                    |         ✅         |
| [`prefer-is-weak-map`](docs/rules/prefer-is-weak-map.md)         | `x instanceof WeakMap` → `isWeakMap`                                 |         ✅         |
| [`prefer-is-weak-set`](docs/rules/prefer-is-weak-set.md)         | `x instanceof WeakSet` → `isWeakSet`                                 |         ✅         |

### Promise

| Rule                                                       | Replaces                                                         | Enabled in presets |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | :----------------: |
| [`prefer-delay`](docs/rules/prefer-delay.md)               | `new Promise(r => setTimeout(r, ms))` → `delay`                  |         ✅         |
| [`prefer-timeout`](docs/rules/prefer-timeout.md)           | `new Promise((_, reject) => setTimeout(reject, ms))` → `timeout` |         ✅         |
| [`prefer-with-timeout`](docs/rules/prefer-with-timeout.md) | `Promise.race` against a rejecting timer → `withTimeout`         |         ✅         |

### String

| Rule                                                           | Replaces                                                       | Enabled in presets |
| -------------------------------------------------------------- | -------------------------------------------------------------- | :----------------: |
| [`prefer-capitalize`](docs/rules/prefer-capitalize.md)         | `s[0].toUpperCase() + s.slice(1).toLowerCase()` → `capitalize` |         ✅         |
| [`prefer-escape-reg-exp`](docs/rules/prefer-escape-reg-exp.md) | `s.replace(/[.*+?^${}()\|[\]\\]/g, '\\$&')` → `escapeRegExp`   |         ✅         |
| [`prefer-lower-first`](docs/rules/prefer-lower-first.md)       | `s[0].toLowerCase() + s.slice(1)` → `lowerFirst`               |         ✅         |
| [`prefer-trim`](docs/rules/prefer-trim.md)                     | `s.replace(/^-+\|-+$/g, '')` → `trim`                          |         ✅         |
| [`prefer-trim-end`](docs/rules/prefer-trim-end.md)             | `s.replace(/\/+$/, '')` → `trimEnd`                            |         ✅         |
| [`prefer-trim-start`](docs/rules/prefer-trim-start.md)         | `s.replace(/^\/+/, '')` → `trimStart`                          |         ✅         |
| [`prefer-upper-first`](docs/rules/prefer-upper-first.md)       | `s[0].toUpperCase() + s.slice(1)` → `upperFirst`               |         ✅         |

## Configuration

- **Method-call chains.** Rules that replace `.filter(...)` or `.reduce(...)` report by
  default only a call outside a method-call chain: `items.filter(Boolean)`, not
  `items.map(f).filter(Boolean)`. One plugin setting changes that for all of them, and each
  rule can override it: see [Method-call chains](docs/method-call-chains.md).
- **Rule options.** [`prefer-is-browser`](docs/rules/prefer-is-browser.md#options) and
  [`prefer-without`](docs/rules/prefer-without.md#options) take an option; the other rules
  have none.
- **Code that readers copy**, such as documentation demos, may be better off without an
  es-toolkit import. Leave it out with a global `ignores` entry:

  ```js
  export default defineConfig([
    { ignores: ['docs/demos/**'] },
    esToolkit.configs.all,
  ]);
  ```

## Before you apply a suggestion

- **A report is a hint, not a proof.** The plugin is at an early stage, and it matches code
  by its shape. It has no type information, so it cannot always tell whether `x.slice(1)` is
  called on an array or a string, or whether a global such as `Math` is shadowed. False positives are possible.
- **Nothing is rewritten for you.** There is no auto-fix and no editor suggestion. You make
  the replacement, add the import, and add `es-toolkit` to your dependencies.
- **Check the semantics.** A hand-written idiom and the utility can differ for some inputs:
  `Math.max(Math.min(v, hi), lo)` and `clamp(v, lo, hi)` disagree when `lo > hi`, and
  `isEmpty` follows lodash rules. Each rule's **Limitations** section lists the known
  differences; read it before rewriting code you are not sure about.
- **One report per snippet.** With every rule on, opt-in ones included, a piece of code is
  reported by one rule, so suggestions do not compete.

Found a false positive or a missed case?
[Open an issue](https://github.com/syxov/es-toolkit-eslint-plugin/issues).

## Development

```sh
pnpm install
pnpm test      # vitest + RuleTester
pnpm build     # tsc -> dist/
pnpm check     # format, lint, typecheck, test
```

Detection is written as [esquery](https://eslint.org/docs/latest/extend/selectors) selectors
where possible, with scope checks in JS where a selector alone would report false positives.
[AGENTS.md](AGENTS.md) describes how rules are built, tested and reviewed against a corpus of
real projects.

## License

MIT
