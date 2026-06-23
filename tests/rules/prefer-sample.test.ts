import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferSample } from '../../src/rules/prefer-sample.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-sample', preferSample, {
  valid: [
    'sample(arr);',
    'arr[Math.floor(Math.random() * 3)];',
    'arr[i];',
    'arr[Math.floor(x)];',
  ],
  invalid: [
    {
      code: 'arr[Math.floor(Math.random() * arr.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'items[Math.floor(Math.random() * items.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'getArr()[Math.floor(Math.random() * getArr().length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'const pick: string = words[Math.floor(Math.random() * words.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
  ],
});
