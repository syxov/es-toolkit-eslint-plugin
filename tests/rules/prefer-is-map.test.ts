import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsMap } from '../../src/rules/prefer-is-map.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-map', preferIsMap, {
  valid: [
    'isMap(value);',
    'value instanceof Set;',
    'value instanceof MapLike;',
    'value instanceof window.Map;',
    'value instanceof globalThis.Map;',
    'Map instanceof value;',
    'value.constructor === Map;',
  ],
  invalid: [
    {
      code: 'value instanceof Map;',
      errors: [{ messageId: 'preferIsMap' }],
    },
    {
      code: '!(value instanceof Map);',
      errors: [{ messageId: 'preferIsMap' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof Map;',
      errors: [{ messageId: 'preferIsMap' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof Map) use(value); }',
      errors: [{ messageId: 'preferIsMap' }],
    },
  ],
});
