import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsSubset } from '../../src/rules/prefer-is-subset.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-subset', preferIsSubset, {
  valid: [
    'isSubset(superset, subset);',
    // `isSubset` takes arrays, not sets.
    'subset.every((x) => set.has(x));',
    // A string receiver makes `.includes` a substring test.
    "chars.every((c) => 'abc'.includes(c));",
    'chars.every((c) => `${prefix}abc`.includes(c));',
    'words.every((w) => getText().includes(w));',
    "const text = 'abc'; chars.every((c) => text.includes(c));",
    'function f(text: string) { return words.every((w) => text.includes(w)); }',
    'const pathname = location.pathname; parts.every((p) => pathname.includes(p));',
    // Named like a single string: a substring test.
    'slotNames.every((slotName) => expose.type.includes(slotName));',
    'words.every((w) => text.includes(w));',
    'parts.every((p) => fileName.includes(p));',
    // Not the element itself, or the receiver depends on it.
    'subset.every((x) => superset.includes(x.id));',
    'subset.every((x) => x.tags.includes(x));',
    'subset.every((x) => lookup[x].includes(x));',
    'subset.every((x) => superset.includes(x, 1));',
    'subset.every((x) => !superset.includes(x));',
    'subset.some((x) => superset.includes(x));',
    'subset.every((x, i) => superset.includes(x));',
    'subset.every(function (x) { return superset.includes(x); });',
    'subset.every((x) => superset.includes(x), ctx);',
    // Optional calls short-circuit on a nil receiver; `isSubset` would throw.
    'subset?.every((x) => superset.includes(x));',
    'subset.every((x) => superset?.includes(x));',
    'subset.every?.((x) => superset.includes(x));',
    // Typed arrays are not accepted by `isSubset`.
    'const bytes = new Uint8Array(4); bytes.every((x) => allowed.includes(x));',
  ],
  invalid: [
    {
      code: 'subset.every((x) => superset.includes(x));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: 'if (required.every((key) => this.keys.includes(key))) run();',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: 'const ok = Object.keys(options).every((k) => allowed.includes(k));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: 'return expectedViews.every((view) => views.includes(view));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: 'subset.every((x) => Array.from(seen).includes(x));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: "const valid = modes.every((m) => ['light', 'dark'].includes(m));",
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: '!subset.every((x) => superset.includes(x));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: 'const covered = (picked as string[]).every((name: string) => (names as string[]).includes(name));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
    {
      code: 'a.map((x) => x.id).every((id) => ids.includes(id));',
      errors: [{ messageId: 'preferIsSubset' }],
    },
  ],
});
