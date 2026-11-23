import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferInvert } from '../../src/rules/prefer-invert.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-invert', preferInvert, {
  valid: [
    'invert(o);',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, v]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k]));',
    // The swapped entry is transformed on the way.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v.id, k]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, f(k)]));',
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [String(v), k]));',
    // Not the destructured parameters.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [b, a]));',
    'Object.fromEntries(Object.entries(o).map(([k, v], i) => [v, k]));',
    'Object.fromEntries(Object.entries(o).map((e) => [e[1], e[0]]));',
    'Object.fromEntries(Object.entries(o).map(([k, [v]]) => [v, k]));',
    // Not an `Object.entries(o)` frame.
    'Object.fromEntries(pairs.map(([k, v]) => [v, k]));',
    'new Map(Object.entries(o).map(([k, v]) => [v, k]));',
    'Object.entries(o).map(([k, v]) => [v, k]);',
    'Object.fromEntries(Object.entries(o).filter(([k, v]) => v).map(([k, v]) => [v, k]));',
  ],
  invalid: [
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));',
      errors: [{ messageId: 'preferInvert' }],
    },
    {
      code: 'const byCode = Object.fromEntries(Object.entries(codes).map(([name, code]) => [code, name]));',
      errors: [{ messageId: 'preferInvert' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(function ([k, v]) { return [v, k]; }));',
      errors: [{ messageId: 'preferInvert' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(o).map(([k, v]) => { return [v, k]; }));',
      errors: [{ messageId: 'preferInvert' }],
    },
    {
      code: 'Object.fromEntries(Object.entries(Colors).map(([k, v]: [string, string]) => [v, k])) as Record<string, string>;',
      errors: [{ messageId: 'preferInvert' }],
    },
  ],
});
