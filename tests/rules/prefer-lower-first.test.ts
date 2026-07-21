import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferLowerFirst } from '../../src/rules/prefer-lower-first.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-lower-first', preferLowerFirst, {
  valid: [
    'lowerFirst(name);',
    'a.charAt(0).toLowerCase() + b.slice(1);',
    'name.charAt(0).toLowerCase() + name.slice(2);',
    'name.charAt(0).toUpperCase() + name.slice(1);',
  ],
  invalid: [
    {
      code: 'name.charAt(0).toLowerCase() + name.slice(1);',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
    {
      code: 'const value: string = label.charAt(0).toLowerCase() + label.slice(1);',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
  ],
});
