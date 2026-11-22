import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferUpperFirst } from '../../src/rules/prefer-upper-first.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-upper-first', preferUpperFirst, {
  valid: [
    'upperFirst(s);',
    // Lower-casing the rest is `capitalize`, not `upperFirst`.
    's.charAt(0).toUpperCase() + s.slice(1).toLowerCase();',
    's[0].toUpperCase() + s.substring(1).toLowerCase();',
    '`${s[0].toUpperCase()}${s.slice(1).toLowerCase()}`;',
    // Lower-casing the first character is `lowerFirst`.
    's.charAt(0).toLowerCase() + s.slice(1);',
    '`${s[0].toLowerCase()}${s.slice(1)}`;',
    'a.charAt(0).toUpperCase() + b.slice(1);',
    's.charAt(0).toUpperCase() + s.slice(2);',
    's.charAt(1).toUpperCase() + s.slice(1);',
    "s.charAt('0').toUpperCase() + s.slice('1');",
    "s['0'].toUpperCase() + s.slice(1);",
    's.substr(1) + s.charAt(0).toUpperCase();',
    's.slice(1) + s.charAt(0).toUpperCase();',
    's.charAt(0).toUpperCase() - s.slice(1);',
    's.charAt(0).toUpperCase() + s.substr(1);',
    's.charAt(0).toUpperCase() + s.slice(1, 3);',
    's.charAt(0)[toUpperCase]() + s.slice(1);',
    '`${a[0].toUpperCase()}${b.slice(1)}`;',
    '`Hi ${s[0].toUpperCase()}${s.slice(1)}`;',
    '`${s[0].toUpperCase()}-${s.slice(1)}`;',
    '`${s[0].toUpperCase()}${s.slice(1)}!`;',
    'tag`${s[0].toUpperCase()}${s.slice(1)}`;',
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
      code: 's.charAt(0).toUpperCase() + s.substring(1);',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
    {
      code: '`${s[0].toUpperCase()}${s.slice(1)}`;',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
    {
      code: 'const label = `${user.name.charAt(0).toUpperCase()}${user.name.substring(1)}`;',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
    {
      code: 'const out: string = name.charAt(0).toUpperCase() + name.slice(1);',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
    {
      code: 'const out = (value as string)[0].toUpperCase() + (value as string).slice(1);',
      errors: [{ messageId: 'preferUpperFirst' }],
    },
  ],
});
