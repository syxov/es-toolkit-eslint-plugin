import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferLowerFirst } from '../../src/rules/prefer-lower-first.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-lower-first', preferLowerFirst, {
  valid: [
    'lowerFirst(name);',
    'a.charAt(0).toLowerCase() + b.slice(1);',
    'a[0].toLowerCase() + b.slice(1);',
    'name.charAt(0).toLowerCase() + name.slice(2);',
    'name[1].toLowerCase() + name.slice(1);',
    "name['0'].toLowerCase() + name.slice(1);",
    'name.charAt(0).toLowerCase() + name.substr(1);',
    // Upper-casing the first character is `upperFirst` / `capitalize`.
    'name.charAt(0).toUpperCase() + name.slice(1);',
    'name[0].toUpperCase() + name.slice(1);',
    'name[0].toUpperCase() + name.slice(1).toLowerCase();',
    '`${name[0].toUpperCase()}${name.slice(1)}`;',
    '`${name[0].toUpperCase()}${name.substring(1).toLowerCase()}`;',
    // Lower-casing everything is `name.toLowerCase()`, not `lowerFirst`.
    'name[0].toLowerCase() + name.slice(1).toLowerCase();',
    '`${a[0].toLowerCase()}${b.slice(1)}`;',
    '`_${name[0].toLowerCase()}${name.slice(1)}`;',
    'tag`${name[0].toLowerCase()}${name.slice(1)}`;',
  ],
  invalid: [
    {
      code: 'name.charAt(0).toLowerCase() + name.slice(1);',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
    {
      code: 'name[0].toLowerCase() + name.slice(1);',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
    {
      code: 'name[0].toLowerCase() + name.substring(1);',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
    {
      code: '`${name[0].toLowerCase()}${name.slice(1)}`;',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
    {
      code: 'const key = `${name.charAt(0).toLowerCase()}${name.substring(1)}`;',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
    {
      code: 'const value: string = label.charAt(0).toLowerCase() + label.slice(1);',
      errors: [{ messageId: 'preferLowerFirst' }],
    },
  ],
});
