import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferCapitalize } from '../../src/rules/prefer-capitalize.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-capitalize', preferCapitalize, {
  valid: [
    'capitalize(s);',
    // No `.toLowerCase()` on the rest is `upperFirst`, not `capitalize`.
    's.charAt(0).toUpperCase() + s.slice(1);',
    's[0].toUpperCase() + s.substring(1);',
    '`${s[0].toUpperCase()}${s.slice(1)}`;',
    // Lower-casing the first character is `lowerFirst`.
    's.charAt(0).toLowerCase() + s.slice(1);',
    's[0].toLowerCase() + s.slice(1).toLowerCase();',
    'a.charAt(0).toUpperCase() + b.slice(1).toLowerCase();',
    's.charAt(0).toUpperCase() + s.slice(2).toLowerCase();',
    's.charAt(0).toUpperCase() + s.substring(2).toLowerCase();',
    's.charAt(0).toUpperCase() + s.substr(1).toLowerCase();',
    's.charAt(0).toUpperCase() + s.slice(1).toUpperCase();',
    's.charAt(0).toUpperCase() + s.toLowerCase().slice(1);',
    "s.charAt(0).toUpperCase() + s.slice('1').toLowerCase();",
    '`${a[0].toUpperCase()}${b.slice(1).toLowerCase()}`;',
    '`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}.`;',
    'tag`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`;',
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
      code: 's.charAt(0).toUpperCase() + s.substring(1).toLowerCase();',
      errors: [{ messageId: 'preferCapitalize' }],
    },
    {
      code: '`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`;',
      errors: [{ messageId: 'preferCapitalize' }],
    },
    {
      code: 'const title = `${word.charAt(0).toUpperCase()}${word.substring(1).toLowerCase()}`;',
      errors: [{ messageId: 'preferCapitalize' }],
    },
    {
      code: 'const out: string = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();',
      errors: [{ messageId: 'preferCapitalize' }],
    },
  ],
});
