# CLAUDE.md

Guidance for working in this repository.

## What this is

`es-toolkit-eslint-plugin` — an open-source ESLint plugin that actively suggests
[es-toolkit](https://es-toolkit.dev) utilities in place of verbose hand-written JS/TS.

Core principles (apply to every rule):

- **Report-only, never auto-fix.** `meta.type: 'suggestion'`, no `fixable`, no
  `hasSuggestions`. Rules report; the developer rewrites.
- **esquery-first.** Push detection into the selector string as far as it goes. When a
  selector alone cannot rule out a false positive, write JS in `create()` (AST walks, scope
  lookups) — precision beats a short rule body.
- **Self-documenting code.** Minimal comments, in English only, and only where the
  _why_ is non-obvious.
- **ESLint 10, flat-config only.** No legacy `.eslintrc` support.

## Commands (pnpm)

```sh
pnpm install      # also runs esbuild's approved build script
pnpm test         # vitest run — RuleTester suites
pnpm test:watch   # vitest watch
pnpm build        # tsc -p tsconfig.build.json -> dist/ (with .d.ts)
pnpm lint         # eslint . (typescript-eslint strict + eslint-plugin-eslint-plugin + vitest)
pnpm typecheck    # tsc --noEmit over src/ and tests/
pnpm format       # prettier --write .
pnpm check        # format:check + lint + typecheck + test; run before committing
```

## Layout

```
src/
  index.ts                  # plugin object: meta, rules, configs.array/function/math/object/predicate/promise/string/all
  utils/create-rule.ts      # shared RuleCreator factory — reuse for every rule
  utils/ast.ts              # isIdentifierNamed, isLiteralValue, isSameExpression, isWriteTarget, referencesParam
  utils/selectors.ts        # shared esquery fragments (filterArrow, mapReceiver, stringContext)
  utils/array-method-chain.ts # shared chain-position policy, option schema and types
  utils/sum-reducer.ts      # sum / sumBy reduce shapes shared by the sum and mean rules
  utils/is-mean-numerator.ts  # `xs.reduce(…) / xs.length`: owned by the mean rules, skipped by sum rules
  utils/is-sample-index.ts  # `a[Math.floor(Math.random() * a.length)]`: prefer-sample vs prefer-random-int
  utils/nil-check.ts        # null/undefined comparisons and `x === null || x === undefined` pairs
  utils/string-case.ts      # first-character / rest helpers for the string rules
  utils/entries-map.ts      # `Object.fromEntries(…)`, `.map(cb)` and entry-callback fragments
  utils/key-entry-callback.ts # `xs.map(p => [key, p])` entry callbacks: prefer-key-by, prefer-uniq-by
  utils/scope.ts            # isDeclaredInCode / isUndeclaredIdentifier (`typeof window`), bindsHelperName
  utils/variable-sources.ts # where a local variable's value comes from (init, for…of element, callback param)
  utils/statement.ts        # enclosing statement and descendant search for same-statement checks
  utils/some-descendant.ts  # depth-first "does any node below match" walk
  utils/type-test.ts        # typeof/instanceof tests: shared selector, multi-type dispatch chains
  utils/predicate-site.ts   # sites a predicate rule skips (`expect(typeof x === …)`, helper name taken)
  utils/non-array-receiver.ts # strings, typed arrays, Buffer, DOM collections: the slice/last rules
  utils/positional-receiver.ts # `xs[0]` slot reads (tuples, regex matches, argument lists): prefer-head
  utils/optional-chain.ts   # `xs?.filter(…)` receivers, which a rewrite would dereference
  utils/includes-receiver.ts # `b.includes(x)` receivers that are certainly arrays: difference/intersection
  utils/set-round-trip.ts   # `[...new Set(x)]` / `Array.from(new Set(x))`: prefer-uniq, prefer-union
  rules/<name>.ts           # one file per rule
tests/rules/<name>.test.ts  # RuleTester valid/invalid matrix per rule
tests/overlap.test.ts       # every rule (opt-in too) over snippets: exactly which rules fire on each
docs/rules/<name>.md        # one doc per rule
```

## Adding a new rule

Naming: `prefer-<utility>` (e.g. `prefer-clamp`, `prefer-uniq`, `prefer-debounce`),
used as `es-toolkit/<name>`.

1. **`src/rules/<name>.ts`** — build the rule with the shared factory:

   ```ts
   import type { TSESTree } from '@typescript-eslint/utils';
   import { createRule } from '../utils/create-rule.js'; // .js extension required (NodeNext ESM)

   export const <camelName> = createRule({
     name: '<name>',
     meta: {
       type: 'suggestion',
       docs: {
         description: 'Enforce using `<utility>` from es-toolkit instead of …',
       },
       schema: [],
       messages: { <messageId>: 'Prefer `<utility>` from es-toolkit instead of …' },
     },
     create(context) {
       const report = (node: TSESTree.Node) =>
         context.report({ node, messageId: '<messageId>' });
       return { '<esquery-selector>': report };
     },
   });
   ```

2. **Register** in `src/index.ts`: add to `rules` and to exactly one category map
   (`arrayRules`, `functionRules`, `mathRules`, `objectRules`, `predicateRules`,
   `promiseRules`, `stringRules`) — the es-toolkit category of the suggested utility — with
   severity `'error'`. `configs.all` is built from the category maps; `tests/index.test.ts`
   asserts every rule sits in exactly one category.

   **Opt-in rules** match idioms that are often deliberate (`arr.slice(0, n)`, `x => x`,
   `() => {}`), so they are registered with severity `'off'`: even `configs.all` leaves them
   disabled. Their doc and README row say so.

3. **`tests/rules/<name>.test.ts`** — `RuleTester` from `@typescript-eslint/rule-tester`,
   a `valid`/`invalid` matrix. Assert only `messageId` (no `output` — report-only).
   Include at least one TypeScript sample and the obvious false-positive cases as `valid`.
4. **`docs/rules/<name>.md`** — what/why, ✅/❌ examples, and a **Limitations** section.
5. **README.md** — add a row to the rules table.

### Array-method replacement rules

Rules that replace `.filter(...)` or `.reduce(...)` must use `utils/array-method-chain.ts`,
whatever their category (e.g. `prefer-compact` is in `array`, `prefer-sum` is in `math`). They support the global setting
`settings['es-toolkit'].arrayMethods.chainPosition`, overridden by the rule option
`{ chainPosition }`. Valid values are `always`, `chain-start`, `chain-end`,
`chain-boundaries`, and `outside-chain` (the default). Test the default, global setting, local
override, and chained positions; document the setting in the rule doc and README.

Put `schema: arrayMethodRuleSchema` and `defaultOptions: [{}] satisfies ArrayMethodRuleOptions`
inside `meta` (top-level `defaultOptions` is deprecated). Read the resolved options from
`create(context, [options])` and pass `options` to `shouldReportArrayMethodReplacement`; raw
`context.options` may be empty. `prefer-without` shows how to add a rule-specific option.

### Reference rule

`prefer-clamp` detects `Math.min(Math.max(…))` / `Math.max(Math.min(…))` and suggests
`clamp`. It composes selectors from helpers so both nesting orders and either argument
order are covered with no JS branching. Read `src/rules/prefer-clamp.ts` before writing a
new rule.

## esquery cheat-sheet

Detection lives in the selector. Useful constructs (all supported by ESLint's esquery):

- Nested attribute path: `[callee.object.name="Math"]`
- Array length: `[arguments.length=2]`
- Has a direct child matching: `:has(> CallExpression…)`
- OR / either-of: `:matches(sel1, sel2)` or regex value `[callee.property.name=/^(min|max)$/]`
- A rule may register **multiple** selector keys, each pointing at a handler.
- **Values are compared as strings.** `[arguments.0.value=0]` also matches `'0'`, and
  `[right.value=null]` matches `'null'`. Match number/null literals by `raw`:
  `[x.type="Literal"][x.raw="0"]`, or use `isLiteralValue` in JS.

Detection starts in the selector; JS takes over where a selector cannot tell a real match
from a false positive. Scope analysis (`context.sourceCode.getScope`, e.g. "is this
identifier declared", "what is this variable initialised with") and walks over the
enclosing function are fine when they remove false positives found in the corpus. Keep
such checks as small typed helpers, shared through `src/utils/` when several rules need
them (`referencesParam` is an example). Rules do not use type information
(`parserServices`): they must work without typed linting. What remains undetectable
without types is documented in the rule's **Limitations**.

### One report per snippet

With every rule enabled (opt-in ones included) a snippet must be reported by exactly one rule. When two rules can
match the same code, decide which one owns it and make the other skip it through a shared
helper in `src/utils/` (e.g. `prefer-flatten` skips `arr.map(f).flat()`, which belongs to
`prefer-flat-map`; `prefer-head`/`prefer-tail` skip string idioms owned by the string
rules). Add the snippet to `tests/overlap.test.ts`, which asserts the exact set of rules
that fire.

## Project notes / gotchas

- **ESM** (`"type": "module"`, `module: NodeNext`): relative imports in `.ts` files must
  use the `.js` extension.
- **`@typescript-eslint/utils` is a runtime `dependency`** (rules import `ESLintUtils`),
  not a devDependency.
- **Vitest needs `globals: true`** (set in `vitest.config.ts`) so `@typescript-eslint/rule-tester`
  finds the `describe`/`it`/`afterAll` hooks.
- **pnpm 11**: esbuild's build script is approved via `pnpm-workspace.yaml` (`allowBuilds`).
- `dist/` is git-ignored and rebuilt on publish (`prepublishOnly`); it's shipped via
  `package.json` `files`.
- **Style is enforced by Prettier**
  Run `pnpm format` before committing.
- **Lint rules for rule authors** (`eslint.config.js`): `meta.docs.description` starts with
  `Enforce`/`Require`/`Disallow`, every schema property has a `description`, and `meta` keys
  follow `type, docs, schema, defaultOptions, messages`. Report messages keep the
  "Prefer … from es-toolkit" wording.
- **TypeScript 6** defaults `types` to `[]`, so `tsconfig.json` lists `"node"` explicitly.
  `tsconfig.json` type-checks `src/` and `tests/` without emitting; `tsconfig.build.json`
  emits `src/` only.
- `plugin.meta` is read from `package.json` at runtime; do not hard-code the version.
- The plugin is typed with ESLint's own `ESLint.Plugin` / `Linter.Config`, so
  `defineConfig([esToolkit.configs.all])` type-checks in a consumer's `eslint.config.ts`.
  typescript-eslint's `RuleModule` is not assignable to ESLint's rule type, hence the cast
  on `rules` in `src/index.ts`.
