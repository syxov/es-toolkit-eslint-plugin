import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsString } from '../../src/rules/prefer-is-string.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-string', preferIsString, {
  valid: [
    'isString(value);',
    'typeof value === "number";',
    'typeof value == "string";',
  ],
  invalid: [
    {
      code: 'typeof value === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: '"string" === typeof value;',
      errors: [{ messageId: 'preferIsString' }],
    },
    {
      code: 'const valid: boolean = typeof value === "string";',
      errors: [{ messageId: 'preferIsString' }],
    },
  ],
});
