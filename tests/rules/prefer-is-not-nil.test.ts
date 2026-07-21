import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNotNil } from '../../src/rules/prefer-is-not-nil.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-not-nil', preferIsNotNil, {
  valid: ['isNotNil(value);', 'value !== null;', 'value != undefined;'],
  invalid: [
    { code: 'value != null;', errors: [{ messageId: 'preferIsNotNil' }] },
    { code: 'null != value;', errors: [{ messageId: 'preferIsNotNil' }] },
    {
      code: 'const present: boolean = value != null;',
      errors: [{ messageId: 'preferIsNotNil' }],
    },
  ],
});
