import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferCloneDeep } from '../../src/rules/prefer-clone-deep.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-clone-deep', preferCloneDeep, {
  valid: [
    'cloneDeep(x);',
    'structuredClone(x);',
    // Extra arguments change the round-trip: not a plain clone.
    'JSON.parse(JSON.stringify(x, replacer));',
    'JSON.parse(JSON.stringify(x, null, 2));',
    'JSON.parse(JSON.stringify(x), reviver);',
    // Missing or spread arguments.
    'JSON.parse(JSON.stringify());',
    'JSON.parse(JSON.stringify(...args));',
    'JSON.parse();',
    // Only one half of the round-trip.
    'JSON.parse(text);',
    'JSON.stringify(x);',
    'JSON.parse(String(x));',
    'JSON.parse(JSON.parse(x));',
    'JSON.stringify(JSON.parse(x));',
    'JSON.parse(JSON.stringify);',
    // The inner call is not the direct argument.
    "JSON.parse(JSON.stringify(x) + '');",
    'JSON.parse(wrap(JSON.stringify(x)));',
    // Not `JSON.parse`/`JSON.stringify` by name.
    'foo.parse(JSON.stringify(x));',
    'JSON.parse(foo.stringify(x));',
    'obj.JSON.parse(JSON.stringify(x));',
    "JSON['parse'](JSON.stringify(x));",
    "JSON.parse(JSON['stringify'](x));",
    // Owned by prefer-is-equal.
    'JSON.stringify(a) === JSON.stringify(b);',
  ],
  invalid: [
    {
      code: 'JSON.parse(JSON.stringify(x));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'JSON.parse(JSON.stringify(this.state));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'JSON.parse(JSON.stringify(getConfig()));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'JSON.parse(JSON.stringify(a.b[0]));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'JSON.parse(JSON.stringify({ ...defaults, ...overrides }));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'const copy = JSON.parse(JSON.stringify(original));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'function snapshot(state) { return JSON.parse(JSON.stringify(state)); }',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'setState(JSON.parse(JSON.stringify(state)));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'const items = list.map((item) => JSON.parse(JSON.stringify(item)));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'const a2 = JSON.parse(JSON.stringify(a)); const b2 = JSON.parse(JSON.stringify(b));',
      errors: [
        { messageId: 'preferCloneDeep' },
        { messageId: 'preferCloneDeep' },
      ],
    },
    {
      code: 'const c = JSON.parse(JSON.stringify(obj)) as Config;',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'const c: Config = JSON.parse(JSON.stringify(obj));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'const c = JSON.parse(JSON.stringify(obj as Config));',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
  ],
});
