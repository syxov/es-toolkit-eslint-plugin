import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsRegExp } from '../../src/rules/prefer-is-reg-exp.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-reg-exp', preferIsRegExp, {
  valid: [
    'isRegExp(value);',
    'value instanceof Date;',
    'value instanceof RegExpLike;',
    'value instanceof window.RegExp;',
    'value instanceof globalThis.RegExp;',
    'RegExp instanceof value;',
    'value.constructor === RegExp;',
  ],
  invalid: [
    {
      code: 'value instanceof RegExp;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: '!(value instanceof RegExp);',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'const ok: boolean = (input as unknown) instanceof RegExp;',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
    {
      code: 'function check(value: unknown): void { if (value instanceof RegExp) use(value); }',
      errors: [{ messageId: 'preferIsRegExp' }],
    },
  ],
});
