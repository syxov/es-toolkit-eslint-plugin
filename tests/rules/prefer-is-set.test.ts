import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsSet } from '../../src/rules/prefer-is-set.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-set', preferIsSet, {
  valid: [
    'isSet(value);',
    'value instanceof Map;',
    'value instanceof SetLike;',
    'value instanceof window.Set;',
    'value instanceof globalThis.Set;',
    'Set instanceof value;',
    'value.constructor === Set;',
  ],
  invalid: [
    {
      code: 'value instanceof Set;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: '!(value instanceof Set);',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof Set;',
      errors: [{ messageId: 'preferIsSet' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof Set) use(value); }',
      errors: [{ messageId: 'preferIsSet' }],
    },
  ],
});
