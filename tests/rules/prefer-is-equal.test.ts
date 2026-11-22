import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsEqual } from '../../src/rules/prefer-is-equal.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-equal', preferIsEqual, {
  valid: [
    'isEqual(a, b);',
    '!isEqual(a, b);',
    'JSON.stringify(a) === b;',
    'JSON.stringify(a) === String(b);',
    'JSON.stringify(a);',
    'a === b;',
    'JSON.parse(a) === JSON.parse(b);',
    'JSON.stringify(a) < JSON.stringify(b);',
    'JSON.stringify(a) + JSON.stringify(b);',
    'JSON.stringify === JSON.stringify;',
    'JSON.stringify(a, replacer) === JSON.stringify(b, replacer);',
    'JSON.stringify(a, null, 2) === JSON.stringify(b);',
    'obj.JSON.stringify(a) === obj.JSON.stringify(b);',
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
      code: 'JSON.stringify(x) == JSON.stringify(y);',
      errors: [{ messageId: 'preferIsEqual' }],
    },
    {
      code: 'JSON.stringify(x) != JSON.stringify(y);',
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
    {
      code: 'function same<T>(a: T, b: T): boolean { return JSON.stringify(a) === JSON.stringify(b); }',
      errors: [{ messageId: 'preferIsEqual' }],
    },
  ],
});
