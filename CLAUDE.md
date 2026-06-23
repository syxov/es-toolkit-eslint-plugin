# CLAUDE.md

Guidance for working in this repository.

## What this is

`es-toolkit-eslint-plugin` — an open-source ESLint plugin that actively suggests
[es-toolkit](https://es-toolkit.dev) utilities in place of verbose hand-written JS/TS.

Core principles (apply to every rule):

- **Report-only, never auto-fix.** `meta.type: 'suggestion'`, no `fixable`, no
  `hasSuggestions`. Rules report; the developer rewrites.
- **esquery-first.** Push detection into the selector string; keep the `create()` body
  minimal. A typical rule body is ~3 lines.
- **Self-documenting code.** Minimal comments, in English only, and only where the
  _why_ is non-obvious.
- **ESLint 10, flat-config only.** No legacy `.eslintrc` support.

## Commands (pnpm)

```sh
pnpm install      # also runs esbuild's approved build script
pnpm test         # vitest run — RuleTester suites
pnpm test:watch   # vitest watch
pnpm build        # tsc -> dist/ (with .d.ts)
pnpm format       # prettier --write .
pnpm format:check # prettier --check .
```

## Layout

```
src/
  index.ts                  # plugin object: meta, rules, configs.recommended
  utils/create-rule.ts      # shared RuleCreator factory — reuse for every rule
  rules/<name>.ts           # one file per rule
tests/rules/<name>.test.ts  # RuleTester valid/invalid matrix per rule
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
       docs: { description: '…' },
       schema: [],
       messages: { <messageId>: '…' },
     },
     defaultOptions: [],
     create(context) {
       const report = (node: TSESTree.Node) =>
         context.report({ node, messageId: '<messageId>' });
       return { '<esquery-selector>': report };
     },
   });
   ```

2. **Register** in `src/index.ts`: add to `rules` and to `configs.recommended.rules`
   (recommended severity is `'error'`).
3. **`tests/rules/<name>.test.ts`** — `RuleTester` from `@typescript-eslint/rule-tester`,
   a `valid`/`invalid` matrix. Assert only `messageId` (no `output` — report-only).
   Include at least one TypeScript sample and the obvious false-positive cases as `valid`.
4. **`docs/rules/<name>.md`** — what/why, ✅/❌ examples, and a **Limitations** section.
5. **README.md** — add a row to the rules table.

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

Detection is **syntactic** — e.g. `Math` is matched by name, so a shadowed local `Math`
is a known, accepted false-positive risk. Document such limits in the rule's doc instead
of adding scope analysis (keep the rule minimal).

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
- **Style is enforced by Prettier** (`.prettierrc.json`: single quotes, `printWidth: 100`).
  Run `pnpm format` before committing.

## Before publishing

- Add a `repository` field to `package.json`.
