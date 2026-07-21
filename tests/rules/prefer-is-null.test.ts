import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsNull } from '../../src/rules/prefer-is-null.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-null', preferIsNull, {
  valid: ['isNull(value);', 'value == null;', 'value === undefined;'],
  invalid: [
    { code: 'value === null;', errors: [{ messageId: 'preferIsNull' }] },
    { code: 'null === value;', errors: [{ messageId: 'preferIsNull' }] },
    {
      code: 'const empty: boolean = value === null;',
      errors: [{ messageId: 'preferIsNull' }],
    },
  ],
});
