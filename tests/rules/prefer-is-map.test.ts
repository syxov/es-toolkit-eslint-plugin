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
    // One value tested against several types: a dispatch, not a single check.
    'value instanceof Set || value instanceof Map;',
    "typeof value === 'string' || value instanceof Map;",
    "const kind = value instanceof Map ? 'a' : value instanceof Set ? 'b' : 'c';",
    // A test assertion reads better with `toBeInstanceOf`.
    'expect(value instanceof Map).toEqual(true);',
    // The code already has its own `isMap`.
    'const isMap = (value: unknown) => value instanceof Map;',
  ],
  invalid: [
    {
      code: 'import { isMap } from "es-toolkit"; value instanceof Map;',
      errors: [{ messageId: 'preferIsMap' }],
    },
    {
      code: 'value instanceof Map || other instanceof Set;',
      errors: [{ messageId: 'preferIsMap' }],
    },
    {
      code: 'value instanceof Map || value === null;',
      errors: [{ messageId: 'preferIsMap' }],
    },
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
