import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNull } from '../../src/rules/prefer-is-null.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-null', preferIsNull, {
  valid: [
    'isNull(value);',
    '!isNull(value);',
    'value == null;',
    'null != value;',
    'value === undefined;',
    "value === 'null';",
    "'null' !== value;",
    'value === nullish;',
    // Halves of a nil pair belong to prefer-is-nil / prefer-is-not-nil.
    'value === null || value === undefined;',
    'value === undefined || null === value;',
    'value !== null && value !== undefined;',
    "value === null || typeof value === 'undefined';",
    "typeof value !== 'undefined' && value !== null;",
    'value === null || value === void 0;',
    'ready || value === null || value === undefined;',
    'value === null || value === undefined || ready;',
    'a || value === null || value === undefined || b;',
    // `arr.filter(x => x !== null)` belongs to prefer-without.
    'arr.filter(x => x !== null);',
    'arr.filter((item: string | null) => null !== item);',
  ],
  invalid: [
    {
      code: 'arr.filter(x => x === null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.filter(x => other !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.filter(x => x.value !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'arr.find(x => x !== null);',
      errors: [{ messageId: 'preferIsNull' }],
    },
    { code: 'value === null;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'null === value;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'value !== null;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'null !== value;', errors: [{ messageId: 'preferIsNull' }] },
    {
      code: 'const empty: boolean = value === null;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'function present(x: string | null): boolean { return x !== null; }',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || other === undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null && value === undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || value !== undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || value == undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'value === null || ready || value === undefined;',
      errors: [{ messageId: 'preferIsNull' }],
    },
    {
      code: 'a === null || b === null;',
      errors: [{ messageId: 'preferIsNull' }, { messageId: 'preferIsNull' }],
    },
  ],
});
