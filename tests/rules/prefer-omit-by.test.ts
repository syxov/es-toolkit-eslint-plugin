import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferOmitBy } from '../../src/rules/prefer-omit-by.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-omit-by', preferOmitBy, {
  valid: [
    'omitBy(o, isNil);',
    "omit(o, ['a']);",
    // Positive predicates and key selections are owned by prefer-pick-by.
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => v));',
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !!v));',
    'Object.fromEntries(Object.entries(o).filter(([k]) => keys.includes(k)));',
    "Object.fromEntries(Object.entries(o).filter(([k]) => k === 'a'));",
    'Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));',
    // A negated nil check is left to the nil predicate rules.
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !(v == null)));',
    'Object.fromEntries(Object.entries(o).filter(([, v]) => !(v === undefined)));',
    "Object.fromEntries(Object.entries(o).filter(([, v]) => !(typeof v === 'undefined')));",
    // A partial negation is not `!pred`.
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => !keys.includes(k) && v));',
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => !k.startsWith("_") || v));',
    // The predicate reads neither the key nor the value.
    'Object.fromEntries(Object.entries(o).filter(() => !flag));',
    // Not a single destructured entry.
    'Object.fromEntries(Object.entries(o).filter((e) => !e[1]));',
    'Object.fromEntries(Object.entries(o).filter(([k, v], i) => !v));',
    // Not an `Object.entries(o).filter(cb)` frame.
    'Object.fromEntries(entries.filter(([k]) => !keys.includes(k)));',
    'Object.entries(o).filter(([k]) => !keys.includes(k));',
  ],
  invalid: [
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([, v]) => !isNil(v)));',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k, v]) => !v));',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')));",
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k, v]) => !(k === 'a' || v == null)));",
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      // The excluded keys depend on the entry.
      code: 'Object.fromEntries(Object.entries(o).filter(([k, v]) => !v.includes(k)));',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(function ([k, v]) { return !v.hidden; }));',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([, v]: [string, unknown]) => !isEmpty(v))) as Props;',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      // A conjunction of negations is `!(a || b)`.
      code: 'Object.fromEntries(Object.entries(o).filter(([key]) => !BUILT_IN.has(key) && !isBuiltIn(key)));',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k, v]) => k !== 'id' && !isNil(v)));",
      errors: [{ messageId: 'preferOmitBy' }],
    },
    {
      // The nil check rewritten with the helper.
      code: 'Object.fromEntries(Object.entries(o).filter(([, v]) => !isNil(v) && !isEmpty(v)));',
      errors: [{ messageId: 'preferOmitBy' }],
    },
    // Key exclusion: `omit`.
    {
      code: 'Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));',
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: 'const rest = Object.fromEntries(Object.entries(props).filter(([key]) => !omitted.has(key)));',
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'a'));",
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k, v]) => 'a' != k));",
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'a' && k !== 'b'));",
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'children' && !hidden.includes(k)));",
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]) => !(k === 'a' || k === 'b')));",
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(function ([k]) { return k !== 'id'; }));",
      errors: [{ messageId: 'preferOmit' }],
    },
    {
      code: "Object.fromEntries(Object.entries(o).filter(([k]: [keyof Props, unknown]) => k !== 'ref')) as Omit<Props, 'ref'>;",
      errors: [{ messageId: 'preferOmit' }],
    },
  ],
});
