import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferSample } from '../../src/rules/prefer-sample.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-sample', preferSample, {
  valid: [
    'sample(arr);',
    'arr[Math.floor(Math.random() * 3)];',
    'arr[~~(Math.random() * 3)];',
    'arr[i];',
    'arr[Math.floor(x)];',
    // The `.length` belongs to another array.
    'a[Math.floor(Math.random() * b.length)];',
    'a.b[Math.floor(Math.random() * a.length)];',
    // Not exactly `Math.random() * <arr>.length`.
    'a[Math.floor(Math.random() * (a.length - 1))];',
    'a[Math.floor(Math.random() * a.length) + 1];',
    'a[Math.floor(Math.random() + a.length)];',
    'a[Math.floor(rand() * a.length)];',
    'a[Math.floor(Math.random() * a["length"])];',
    'a[Math.round(Math.random() * a.length)];',
    'a[Math.ceil(Math.random() * a.length)];',
    'a[Math.floor(Math.random() * a.length, 1)];',
    'a[~(Math.random() * a.length)];',
    'a[(Math.random() * a.length) | 1];',
    "a[(Math.random() * a.length) | '0'];",
    'a.random;',
    // Writes, not reads.
    'arr[Math.floor(Math.random() * arr.length)] = x;',
    'delete arr[Math.floor(Math.random() * arr.length)];',
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
      code: 'arr[Math.floor(arr.length * Math.random())];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'arr[Math.trunc(Math.random() * arr.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'arr[~~(Math.random() * arr.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'arr[(Math.random() * arr.length) | 0];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'getArr()[Math.floor(Math.random() * getArr().length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'this.items[Math.floor(Math.random() * this.items.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
    {
      code: 'const pick: string = words[Math.floor(Math.random() * words.length)];',
      errors: [{ messageId: 'preferSample' }],
    },
  ],
});
