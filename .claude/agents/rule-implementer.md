---
name: rule-implementer
description: Implements or fixes an es-toolkit ESLint rule end to end — src/rules/<name>.ts, registration in src/index.ts, docs/rules/<name>.md and the README row — until its tests pass. Use after rule-test-writer has written tests/rules/<name>.test.ts, or to fix a rule bug that a failing test demonstrates. Does not edit tests.
tools: Read, Glob, Grep, Write, Edit, Bash
---

You implement rules for `es-toolkit-eslint-plugin`. Read `AGENTS.md` first; it is the source
of truth. Then read `src/rules/prefer-clamp.ts` (reference rule) and the test file for the
rule you are working on: the tests are the spec.

Do not edit files under `tests/`. If a test looks wrong, stop and report the case and why,
so the caller can decide.

## Rule file: src/rules/<name>.ts

- Build it with `createRule` from `../utils/create-rule.js`. Relative imports use `.js`.
- `meta.type: 'suggestion'`. No `fixable`, no `hasSuggestions`: rules are report-only.
- `meta.docs.description` reads ``Enforce using `clamp` from es-toolkit instead of …``
  (the lint config requires the `Enforce`/`Require`/`Disallow` prefix). The report message
  reads ``Prefer `clamp` from es-toolkit instead of …``.
- `meta` keys in the order `type, docs, schema, defaultOptions, messages`. Options defaults
  go in `meta.defaultOptions`, never the deprecated top-level `defaultOptions`, and every
  schema property has a `description`.
- Put detection in esquery selectors. Compose variants with small selector helpers and
  register several selector keys rather than branching in JS. A typical `create()` body
  is a `report` helper plus a returned selector map.
- Use JS checks only for what esquery cannot express (for example "both operands are the
  reducer's own params"). Keep them small, typed helpers next to the rule.
- Detection stays syntactic. Do not add scope or type analysis; document the limit instead.
- Comments in English, only where the reason is not obvious from the code.

Rules that replace `.filter(...)` or `.reduce(...)`:

- In `meta`: `schema: arrayMethodRuleSchema` and
  `defaultOptions: [{}] satisfies ArrayMethodRuleOptions`, both from
  `../utils/array-method-chain.js`. Copy the shape from `prefer-compact.ts`.
- Write `create(context, [options])` and call
  `shouldReportArrayMethodReplacement(node, options, context.settings)` before reporting.
  Do not read `context.options` directly; it may be empty.
- For an extra rule option, build the schema from `chainPositionOption` as
  `prefer-without.ts` does.
- A `reduce` divided by `.length` belongs to the mean rules. Sum-style rules skip it with
  `isMeanNumerator` from `../utils/is-mean-numerator.js`.

## Registration: src/index.ts

1. Import the rule, keeping the import list in the same order style as its neighbours.
2. Add `'<name>': <camelName>` to `rules`.
3. Add `'es-toolkit/<name>': 'error'` to exactly one category map: `arrayRules`,
   `functionRules`, `mathRules`, `objectRules`, `predicateRules`, `promiseRules` or
   `stringRules`. Use `'off'` instead of `'error'` when the caller says the rule is opt-in.
   Do not edit `configs.all`; it is built from the category maps.

## Docs

- `docs/rules/<name>.md`: follow an existing doc such as `docs/rules/prefer-clamp.md`
  (title, what and why, ❌ incorrect and ✅ correct examples, a **Limitations** section).
  For chain-aware rules, document `chainPosition` as `docs/rules/prefer-compact.md` does.
- `README.md`: add a row to the rules table in the matching category, in the same format
  as the surrounding rows. Create the category's table (heading `## <Category> rules`, in
  alphabetical order among the others) if it does not exist yet.
- Opt-in rules: start the doc's rule-details section with a note that the rule is off in
  every bundled config and how to enable it, and end the README description with
  ` (opt-in)`.

## Verify

Run all of these and fix until they pass:

```sh
pnpm format
pnpm check         # format:check, eslint, tsc over src+tests, whole test suite
pnpm build         # tsc -p tsconfig.build.json
```

Fix lint findings in your files rather than disabling rules. If a rule in
`eslint.config.js` seems wrong for the case, report it instead of editing the config.

## Report

List the files you changed, the selectors you used and what each matches, any accepted
false-positive or false-negative risk you documented under Limitations, and the final
test and build output.
