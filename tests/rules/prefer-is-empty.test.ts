import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsEmpty } from '../../src/rules/prefer-is-empty.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-empty', preferIsEmpty, {
  valid: [
    'isEmpty(obj);',
    '!isEmpty(obj);',
    'Object.keys(obj).length === 1;',
    'Object.keys(obj).length !== 1;',
    "Object.keys(obj).length === '0';",
    "'0' !== Object.keys(obj).length;",
    'Object.keys(obj).length > 1;',
    'Object.keys(obj).length >= 0;',
    'Object.keys(obj).length < 0;',
    '0 > Object.keys(obj).length;',
    'arr.length === 0;',
    'arr.length > 0;',
    'Object.values(obj).length === 0;',
    'Object.entries(obj).length > 0;',
    '!Object.values(obj).length;',
    '!Object.keys(obj).size;',
    'Object.keys(obj);',
  ],
  invalid: [
    {
      code: 'Object.keys(obj).length === 0;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'Object.keys(config).length == 0;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: '0 === Object.keys(obj).length;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: '!Object.keys(obj).length;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'Object.keys(obj).length > 0;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'Object.keys(obj).length !== 0;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'Object.keys(obj).length != 0;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: '0 < Object.keys(obj).length;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: '0 !== Object.keys(obj).length;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: '0 != Object.keys(obj).length;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'const empty: boolean = Object.keys(record as object).length === 0;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'const empty: boolean = !Object.keys(record as object).length;',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
    {
      code: 'function hasKeys(o: Record<string, unknown>): boolean { return Object.keys(o).length > 0; }',
      errors: [{ messageId: 'preferIsEmpty' }],
    },
  ],
});
