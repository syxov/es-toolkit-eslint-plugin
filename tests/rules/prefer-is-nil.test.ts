import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNil } from '../../src/rules/prefer-is-nil.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-nil', preferIsNil, {
  valid: [
    'isNil(value);',
    'value === null;',
    'value === undefined;',
    'value != null;',
    "value == 'null';",
    "value == 'undefined';",
    'value == void 1;',
    "typeof value == 'undefined';",
    'value !== null && value !== undefined;',
    'value === null || other === undefined;',
    'value.a === null || value.b === undefined;',
    'value === null && value === undefined;',
    'value === null || value !== undefined;',
    'value === null || value === null;',
    'value === undefined || value === void 0;',
    "value === null || typeof other === 'undefined';",
    'value === null || ready || value === undefined;',
    'value === null ?? value === undefined;',
  ],
  invalid: [
    { code: 'value == null;', errors: [{ messageId: 'preferIsNil' }] },
    { code: 'null == value;', errors: [{ messageId: 'preferIsNil' }] },
    { code: 'value == undefined;', errors: [{ messageId: 'preferIsNil' }] },
    { code: 'undefined == value;', errors: [{ messageId: 'preferIsNil' }] },
    { code: 'value == void 0;', errors: [{ messageId: 'preferIsNil' }] },
    {
      code: 'const empty: boolean = value == null;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'value === null || value === undefined;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'value === undefined || value === null;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'null === value || undefined === value;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'value === void 0 || value === null;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: "value === null || typeof value === 'undefined';",
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: "typeof value == 'undefined' || null === value;",
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: '(value === null) || (value === undefined);',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'obj.items[0] === null || obj.items[0] === undefined;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'ready || value === null || value === undefined;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'value === null || value === undefined || ready;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'a || value === null || value === undefined || b;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'if (value === null || value === undefined) return;',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'function missing(x: string | null | undefined): boolean { return x === null || x === undefined; }',
      errors: [{ messageId: 'preferIsNil' }],
    },
    {
      code: 'a == null || b === null || b === undefined;',
      errors: [{ messageId: 'preferIsNil' }, { messageId: 'preferIsNil' }],
    },
  ],
});
