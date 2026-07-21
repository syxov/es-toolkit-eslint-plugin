import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsWeakMap } from '../../src/rules/prefer-is-weak-map.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-weak-map', preferIsWeakMap, {
  valid: ['isWeakMap(value);'],
  invalid: [
    {
      code: 'value instanceof WeakMap;',
      errors: [{ messageId: 'preferIsWeakMap' }],
    },
  ],
});
