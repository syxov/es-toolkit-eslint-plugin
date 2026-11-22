import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNotNil } from '../../src/rules/prefer-is-not-nil.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-not-nil', preferIsNotNil, {
  valid: [
    'isNotNil(value);',
    'value !== null;',
    'value !== undefined;',
    'value == null;',
    "value != 'null';",
    "value != 'undefined';",
    'value != void 1;',
    "typeof value != 'undefined';",
    'value === null || value === undefined;',
    'value !== null && other !== undefined;',
    'value.a !== null && value.b !== undefined;',
    'value !== null || value !== undefined;',
    'value !== null && value === undefined;',
    'value !== null && value !== null;',
    "value !== null && typeof other !== 'undefined';",
    'value !== null && ready && value !== undefined;',
    'value !== null ?? value !== undefined;',
  ],
  invalid: [
    { code: 'value != null;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'null != value;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'value != undefined;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'undefined != value;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'value != void 0;', errors: [{ messageId: 'preferIsNotNil' }] },
    {
      code: 'const present: boolean = value != null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== null && value !== undefined;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== undefined && value !== null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'null !== value && undefined !== value;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== void 0 && value !== null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: "value !== null && typeof value !== 'undefined';",
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: "'undefined' != typeof value && null !== value;",
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'obj.items[0] !== null && obj.items[0] !== undefined;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'ready && value !== null && value !== undefined;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'value !== null && value !== undefined && ready;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'items.filter(x => x !== null && x !== undefined);',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
    {
      code: 'function present<T>(x: T | null | undefined): x is T { return x !== null && x !== undefined; }',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
  ],
});
