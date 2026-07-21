import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsMap } from '../../src/rules/prefer-is-map.js';
const ruleTester = new RuleTester();
ruleTester.run('prefer-is-map', preferIsMap, {
  valid: ['isMap(value);', 'value instanceof Set;'],
  invalid: [
    { code: 'value instanceof Map;', errors: [{ messageId: 'preferIsMap' }] },
  ],
});
