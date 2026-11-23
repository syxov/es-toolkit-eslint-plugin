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
    // Asserting what survives JSON: `cloneDeep` would make the assertion vacuous.
    'expect(JSON.parse(JSON.stringify(ast))).toEqual(ast);',
    'expect(sentData.editor).toEqual(JSON.parse(JSON.stringify(getUsageData(editor))));',
    'expect(Reflect.ownKeys(node)).toEqual(Object.keys(JSON.parse(JSON.stringify(node))));',
    'expect(a).not.toEqual(JSON.parse(JSON.stringify(b)));',
    // Named after serialising, sanitising or detaching: the JSON semantics are the point.
    'function sanitizeError(error: Error) { return { ...JSON.parse(JSON.stringify(error)), message: error.message }; }',
    'function toSerializableMeta<T>(obj: T): Serializable<T> { return JSON.parse(JSON.stringify(obj)); }',
    'const resultJson = JSON.parse(JSON.stringify(result));',
    'const toPlainObject = (value) => JSON.parse(JSON.stringify(value));',
    'function detachSnapshot<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }',
    'class Model { toJSONData() { return JSON.parse(JSON.stringify(this.data)); } }',
    // A benchmark of the round-trip itself.
    'await benchmark(async () => { for (const p of paths) JSON.parse(JSON.stringify(p)); });',
    "bench('json', () => { JSON.parse(JSON.stringify(data)); });",
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
    {
      // A clone in a test that is not itself asserted.
      code: "it('loads', async () => { await canvas.loadFromJSON(JSON.parse(JSON.stringify(PATH_JSON))); });",
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      // A variable name only says what it holds: a clone of serialised data is still a clone.
      code: "it('loads', async () => { const serialized = JSON.parse(JSON.stringify(PATH_JSON)); serialized.background = 'green'; });",
      errors: [{ messageId: 'preferCloneDeep' }],
    },
    {
      code: 'function deepClone(value) { return JSON.parse(JSON.stringify(value)); }',
      errors: [{ messageId: 'preferCloneDeep' }],
    },
  ],
});
