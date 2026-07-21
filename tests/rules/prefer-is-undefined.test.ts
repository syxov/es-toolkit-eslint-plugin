import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsUndefined } from '../../src/rules/prefer-is-undefined.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-undefined', preferIsUndefined, {
  valid: ['isUndefined(value);', 'value == undefined;', 'value === null;'],
  invalid: [
    {
      code: 'value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'undefined === value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'const missing: boolean = value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
  ],
});
