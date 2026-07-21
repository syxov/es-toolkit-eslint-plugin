import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsWeakSet } from '../../src/rules/prefer-is-weak-set.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-weak-set', preferIsWeakSet, {
  valid: ['isWeakSet(value);'],
  invalid: [
    {
      code: 'value instanceof WeakSet;',
      errors: [{ messageId: 'preferIsWeakSet' }],
    },
  ],
});
