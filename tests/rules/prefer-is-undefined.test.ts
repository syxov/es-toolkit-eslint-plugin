import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsUndefined } from '../../src/rules/prefer-is-undefined.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-is-undefined', preferIsUndefined, {
  valid: [
    'isUndefined(value);',
    '!isUndefined(value);',
    'value == undefined;',
    'undefined != value;',
    'value == void 0;',
    'value === null;',
    "value === 'undefined';",
    'value === void 1;',
    "value === void '0';",
    "typeof value === 'string';",
    'typeof value === kind;',
    "void value === 'undefined';",
    // Halves of a nil pair belong to prefer-is-nil / prefer-is-not-nil.
    'value === null || value === undefined;',
    'undefined === value || value === null;',
    'value !== undefined && value !== null;',
    "value === null || typeof value === 'undefined';",
    "typeof value != 'undefined' && null !== value;",
    'value === void 0 || value === null;',
    'ready || value === null || value === undefined;',
    // `arr.filter(x => x !== undefined)` belongs to prefer-without.
    'arr.filter(x => x !== undefined);',
    'arr.filter((item?: string) => void 0 !== item);',
  ],
  invalid: [
    {
      code: 'arr.filter(x => x === undefined);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "arr.filter(x => typeof x !== 'undefined');",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'arr.filter(x => x.value !== undefined);',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'undefined === value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value !== undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'undefined !== value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value === void 0;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'void 0 !== value;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "typeof value === 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "typeof value == 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "typeof value !== 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "typeof value != 'undefined';",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "'undefined' === typeof value;",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: "'undefined' != typeof value;",
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'const missing: boolean = value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'function given(x?: number): boolean { return x !== undefined; }',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value === null || other === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value !== null || value !== undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
    {
      code: 'value == null || value === undefined;',
      errors: [{ messageId: 'preferIsUndefined' }],
    },
  ],
});
