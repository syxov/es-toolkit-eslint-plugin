import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsEqual } from '../../src/rules/prefer-is-equal.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-equal', preferIsEqual, {
  valid: [
    'isEqual(a, b);',
    'JSON.stringify(a) === b;',
    'JSON.stringify(a);',
    'a === b;',
    'JSON.parse(a) === JSON.parse(b);',
  ],
  invalid: [
    {
      code: 'JSON.stringify(a) === JSON.stringify(b);',
      errors: [{ messageId: 'preferIsEqual' }],
    },
    {
      code: 'JSON.stringify(x) !== JSON.stringify(y);',
      errors: [{ messageId: 'preferIsEqual' }],
    },
    {
      code: 'if (JSON.stringify(prev) === JSON.stringify(next)) doThing();',
      errors: [{ messageId: 'preferIsEqual' }],
    },
    {
      code: 'const same: boolean = JSON.stringify(a as object) === JSON.stringify(b as object);',
      errors: [{ messageId: 'preferIsEqual' }],
    },
  ],
});
