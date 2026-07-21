import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsSet } from '../../src/rules/prefer-is-set.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-set', preferIsSet, {
  valid: ['isSet(value);', 'value instanceof Map;'],
  invalid: [
    { code: 'value instanceof Set;', errors: [{ messageId: 'preferIsSet' }] },
  ],
});
