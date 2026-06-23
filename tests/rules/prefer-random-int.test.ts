import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferRandomInt } from '../../src/rules/prefer-random-int.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-random-int', preferRandomInt, {
  valid: [
    'randomInt(0, 10);',
    'random(0, 1);',
    'Math.random();',
    'Math.floor(x / 2);',
    'Math.round(Math.random() * n);',
    'Math.ceil(Math.random() * n);',
    '~(Math.random() * n);',
    '(Math.random() * 6) | 1;',
    'arr[Math.floor(Math.random() * arr.length)];',
    'arr[~~(Math.random() * arr.length)];',
  ],
  invalid: [
    {
      code: 'Math.floor(Math.random() * 6);',
      errors: [{ messageId: 'preferRandomInt' }],
    },
    {
      code: 'Math.floor(Math.random() * (max - min + 1)) + min;',
      errors: [{ messageId: 'preferRandomInt' }],
    },
    {
      code: 'Math.floor(n * Math.random());',
      errors: [{ messageId: 'preferRandomInt' }],
    },
    {
      code: 'Math.trunc(Math.random() * 6);',
      errors: [{ messageId: 'preferRandomInt' }],
    },
    {
      code: '~~(Math.random() * 6);',
      errors: [{ messageId: 'preferRandomInt' }],
    },
    {
      code: '(Math.random() * 6) | 0;',
      errors: [{ messageId: 'preferRandomInt' }],
    },
    {
      code: 'const dice: number = Math.floor(Math.random() * 6) + 1;',
      errors: [{ messageId: 'preferRandomInt' }],
    },
  ],
});
