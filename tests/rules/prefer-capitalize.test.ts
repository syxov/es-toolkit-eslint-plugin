import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferCapitalize } from '../../src/rules/prefer-capitalize.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-capitalize', preferCapitalize, {
  valid: [
    'capitalize(s);',
    // No `.toLowerCase()` on the rest is `upperFirst`, not `capitalize`.
    's.charAt(0).toUpperCase() + s.slice(1);',
    'a.charAt(0).toUpperCase() + b.slice(1).toLowerCase();',
    's.charAt(0).toUpperCase() + s.slice(2).toLowerCase();',
  ],
  invalid: [
    {
      code: 's.charAt(0).toUpperCase() + s.slice(1).toLowerCase();',
      errors: [{ messageId: 'preferCapitalize' }],
    },
    {
      code: 's[0].toUpperCase() + s.slice(1).toLowerCase();',
      errors: [{ messageId: 'preferCapitalize' }],
    },
    {
      code: 'const out: string = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();',
      errors: [{ messageId: 'preferCapitalize' }],
    },
  ],
});
