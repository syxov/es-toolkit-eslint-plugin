import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferUpperFirst } from '../../src/rules/prefer-upper-first.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-upper-first', preferUpperFirst, {
  valid: [
    'upperFirst(s);',
    // Lower-casing the rest is `capitalize`, not `upperFirst`.
    's.charAt(0).toUpperCase() + s.slice(1).toLowerCase();',
    'a.charAt(0).toUpperCase() + b.slice(1);',
    's.charAt(0).toUpperCase() + s.slice(2);',
    's.charAt(1).toUpperCase() + s.slice(1);',
  ],
  invalid: [
    {
      code: 's.charAt(0).toUpperCase() + s.slice(1);',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
    {
      code: 's[0].toUpperCase() + s.slice(1);',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
    {
      code: 'const out: string = name.charAt(0).toUpperCase() + name.slice(1);',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
  ],
});
