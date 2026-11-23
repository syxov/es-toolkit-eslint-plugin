import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferFindKey } from '../../src/rules/prefer-find-key.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-find-key', preferFindKey, {
  valid: [
    'findKey(o, v => v.active);',
    // The callback only looks at the key.
    "Object.keys(o).find(k => k.startsWith('x'));",
    'Object.keys(o).find(k => other[k]);',
    'Object.keys(o).find(k => o.k);',
    'Object.keys(o).find(k => o[name]);',
    "Object.entries(o).find(([k]) => k.startsWith('x'))?.[0];",
    "Object.entries(o).find(([k, v]) => k.startsWith('x'))?.[0];",
    // Writes to the object are not a lookup.
    'Object.keys(o).find(k => (o[k] = 1));',
    'Object.keys(o).find(k => delete o[k]);',
    // Not a single plain key parameter.
    'Object.keys(o).find((k, i) => o[k] && i > 0);',
    'Object.keys(o).find(({ length }) => length);',
    'Object.keys(o).find(isWanted);',
    'Object.keys(o).find(k => o[k], thisArg);',
    // Not `Object.keys(o).find(...)`.
    'Object.keys(o).filter(k => o[k]);',
    'Object.values(o).find(v => o[v]);',
    'keys.find(k => o[k]);',
    // The entry itself or its value, not its key.
    'Object.entries(o).find(([k, v]) => v.active);',
    'Object.entries(o).find(([k, v]) => v.active)?.[1];',
    'Object.entries(o).find(([k, v]) => v.active)[1];',
    'Object.entries(o).find((e) => e[1].active)?.[0];',
    'Object.entries(o).find(([k, v], i) => v && i)?.[0];',
    'Object.entries(o).find(isWanted)?.[0];',
    'Object.entries(o).filter(([k, v]) => v)[0];',
  ],
  invalid: [
    {
      code: 'Object.keys(o).find(k => o[k] === value);',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'const id = Object.keys(users).find(id => users[id].name === name);',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: "Object.keys(this.map).find(key => this.map[key] === value && key !== 'x');",
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.keys(o).find(function (k) { return o[k].active; });',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.keys(o).find(k => { const v = o[k]; return v > 0; });',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.keys(o).find((k: string) => (o as Record<string, number>)[k] > 0);',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.keys(o).find(k => o[k]!.active);',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.entries(o).find(([k, v]) => v === value)?.[0];',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.entries(o).find(([, v]) => v.active)?.[0];',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'const key = Object.entries(o).find(([k, v]) => v.active && k !== "x")[0];',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.entries(o).find(function ([k, v]) { return v > 0; })?.[0];',
      errors: [{ messageId: 'preferFindKey' }],
    },
    {
      code: 'Object.entries(o).find(([k, v]: [string, number]) => v > 0)![0];',
      errors: [{ messageId: 'preferFindKey' }],
    },
  ],
});
