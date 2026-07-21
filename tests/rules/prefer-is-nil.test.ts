import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNil } from '../../src/rules/prefer-is-nil.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-nil', preferIsNil, {
  valid: ['isNil(value);', 'value === null;', 'value == undefined;'],
  invalid: [
    { code: 'value == null;', errors: [{ messageId: 'preferIsNil' }] },
    { code: 'null == value;', errors: [{ messageId: 'preferIsNil' }] },
    {
      code: 'const empty: boolean = value == null;',
      errors: [{ messageId: 'preferIsNil' }],
    },
  ],
});
