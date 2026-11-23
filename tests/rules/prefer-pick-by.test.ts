import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferPickBy } from '../../src/rules/prefer-pick-by.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-pick-by', preferPickBy, {
  valid: [
    'pickBy(o, v => v != null);',
    "pick(o, ['a', 'b']);",
    // Negated predicates and key exclusions are owned by prefer-omit-by.
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => !v));',
    'Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));',
    "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'a'));",
    "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'a' && k !== 'b'));",
    'Object.fromEntries(Object.entries(o).filter(([key]) => !BUILT_IN.has(key) && !isBuiltIn(key)));',
    // The predicate reads neither the key nor the value.
    'Object.fromEntries(Object.entries(o).filter(() => true));',
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => flag));',
    // Callback shapes that are not a single destructured entry.
    'Object.fromEntries(Object.entries(o).filter(Boolean));',
    'Object.fromEntries(Object.entries(o).filter(isWanted));',
    'Object.fromEntries(Object.entries(o).filter((e) => e[1]));',
    'Object.fromEntries(Object.entries(o).filter(([k, v], i) => i > 0 && v));',
    'Object.fromEntries(Object.entries(o).filter(([k, v = 1]) => v));',
    'Object.fromEntries(Object.entries(o).filter(([k, ...rest]) => rest.length));',
    'Object.fromEntries(Object.entries(o).filter(([k, { a }]) => a));',
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => { log(k); return v; }));',
    // Not an `Object.entries(o).filter(cb)` frame.
    'Object.fromEntries(entries.filter(([k, v]) => v));',
    'Object.entries(o).filter(([k, v]) => v);',
    'new Map(Object.entries(o).filter(([k, v]) => v));',
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => v, thisArg));',
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => v).map(([k, v]) => [k, v * 2]));',
    'Object.fromEntries(Object.keys(o).filter(k => o[k]).map(k => [k, o[k]]));',
  ],
  invalid: [
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k, v]) => v != null));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([, v]) => v));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k, v]) => k.startsWith('_') && v));",
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => k.startsWith('data-')));",
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      // A double negation is a truthiness test.
      code: 'Object.fromEntries(Object.entries(o).filter(([, v]) => !!v));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      // Mixed key and value tests are not a plain key selection.
      code: 'Object.fromEntries(Object.entries(o).filter(([k, v]) => keys.includes(k) && v));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      // A string receiver tests substrings, not membership.
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => 'abc'.includes(k)));",
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      // The candidate list depends on the entry.
      code: 'Object.fromEntries(Object.entries(o).filter(([k, v]) => v.includes(k)));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === 'string'));",
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(function ([k, v]) { return v > 0; }));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k, v]) => { return v > 0; }));',
      errors: [{ messageId: 'preferPickBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(props).filter(([k, v]: [string, unknown]) => v !== undefined)) as Partial<Props>;',
      errors: [{ messageId: 'preferPickBy' }],
    },
    // Key membership: `pick`.
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k]) => keys.includes(k)));',
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k, v]) => ['a', 'b'].includes(k)));",
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([key]) => allowed.has(key)));',
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => k === 'a'));",
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => 'a' === k || k == 'b'));",
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => k === 'a' || k === 'b' || extra.includes(k)));",
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k]) => k === name));',
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: 'const subset = Object.fromEntries(Object.entries(o).filter(function ([k]) { return KEYS.includes(k); }));',
      errors: [{ messageId: 'preferPick' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k]: [string, number]) => (keys as string[]).includes(k)));',
      errors: [{ messageId: 'preferPick' }],
    },
  ],
});
