import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFlatten } from '../../src/rules/prefer-flatten.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-flatten', preferFlatten, {
  valid: [
    'flatten(items);',
    'items.flat(2);',
    'items.flat(Infinity);',
    "items.flat('1');",
    'items.flat(depth);',
    // Owned by prefer-flat-map.
    'items.map(mapper).flat();',
    'items.map(mapper).flat(1);',
  ],
  invalid: [
    { code: 'items.flat();', errors: [{ messageId: 'preferFlatten' }] },
    { code: 'items.flat(1);', errors: [{ messageId: 'preferFlatten' }] },
    {
      code: 'const values: number[] = items.flat();',
      errors: [{ messageId: 'preferFlatten' }],
    },
    // Not a one-argument `.map(callback)` receiver.
    {
      code: 'items.map(mapper, thisArg).flat();',
      errors: [{ messageId: 'preferFlatten' }],
    },
    {
      code: 'items.filter(Boolean).flat();',
      errors: [{ messageId: 'preferFlatten' }],
    },
    { code: 'items.map.flat();', errors: [{ messageId: 'preferFlatten' }] },
  ],
});
