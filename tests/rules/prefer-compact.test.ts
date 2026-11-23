import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferCompact } from '../../src/rules/prefer-compact.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-compact', preferCompact, {
  valid: [
    'compact(arr);',
    'arr.filter((x) => y);',
    'arr.filter((x) => x.foo);',
    'arr.filter((x) => !x);',
    'arr.filter((x) => !!y);',
    'arr.filter((x) => Boolean(x.foo));',
    'arr.map(Boolean);',
    'Boolean(x);',
    'arr.filter(Boolean, thisArg);',
    // `function` callbacks are not matched.
    'arr.filter(function (x) { return x; });',
    'arr.filter(function (x) { return !!x; });',
    'items.filter((x) => x).map((x) => x.id);',
    'items.filter(Boolean).map((x) => x.id);',
    'items.map((x) => x.id).filter(Boolean);',
    'items.map((x) => x).filter(Boolean).map((x) => x.id);',
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'outside-chain' }],
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
    },
    {
      code: 'items.map((x) => x.id).filter(Boolean);',
      options: [{ chainPosition: 'chain-start' }],
    },
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'chain-end' }],
    },
    {
      code: 'items.map((x) => x).filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'chain-boundaries' }],
    },
    // Counting truthy values, not compacting them.
    'const changed = [name !== defaultName, !!storage].filter(Boolean).length;',
    'if ([a, b, c].filter((v) => v).length !== 2) {}',
    'cells.filter(Boolean).length;',
    // An optional call yields `undefined` on a nil receiver; `compact` would throw.
    'model.quickFilterValues?.filter(Boolean);',
    'a?.b.filter((x) => !!x);',
    'arr.filter?.(Boolean);',
  ],
  invalid: [
    {
      code: 'arr.filter(Boolean);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter((x) => x);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'const names = (users as (string | null)[]).filter((u: string | null) => u);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.map((x) => x.id).filter((id) => id);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter((x) => !!x);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter((x) => Boolean(x));',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: "const fields = [a && 'a', b && 'b'].filter(Boolean);",
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      // The first element, not a count.
      code: 'const first = arr.filter(Boolean)[0];',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'const ids = (xs as (string | null)[]).filter((id): id is string => Boolean(id));',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'getList().filter(Boolean);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'const xs = (arr as (string | null)[]).filter((x) => !!x);',
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'chain-start' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.map((x) => x.id).filter(Boolean);',
      options: [{ chainPosition: 'chain-end' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.map((x) => x).filter(Boolean).map((x) => x.id);',
      options: [{ chainPosition: 'always' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'arr.filter(Boolean);',
      options: [{ chainPosition: 'chain-boundaries' }],
      errors: [{ messageId: 'preferCompact' }],
    },
    {
      code: 'items.filter(Boolean).map((x) => x.id);',
      settings: { 'es-toolkit': { arrayMethods: { chainPosition: 'always' } } },
      errors: [{ messageId: 'preferCompact' }],
    },
  ],
});
