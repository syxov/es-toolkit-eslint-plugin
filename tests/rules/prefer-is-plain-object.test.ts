import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferIsPlainObject } from '../../src/rules/prefer-is-plain-object.js';

const ruleTester = new RuleTester();

const errors = [{ messageId: 'preferIsPlainObject' as const }];

ruleTester.run('prefer-is-plain-object', preferIsPlainObject, {
  valid: [
    'isPlainObject(value);',
    // Other tags, or a tag that is stored and compared later (often a dispatch).
    "Object.prototype.toString.call(value) === '[object Array]';",
    "Object.prototype.toString.call(value) === '[object Error]';",
    'Object.prototype.toString.call(value);',
    "const tag = Object.prototype.toString.call(value); tag === '[object Object]';",
    "Object.prototype.toString.call(value).slice(8, -1) === 'Object';",
    // Not the `Object.prototype.toString` of the value.
    "Object.prototype.toString.call(a, b) === '[object Object]';",
    "Object.prototype.toString.apply(value) === '[object Object]';",
    "Foo.prototype.toString.call(value) === '[object Object]';",
    "({ a: 1 }).toString.call(value) === '[object Object]';",
    "value.toString() === '[object Object]';",
    "String(value) === '[object Object]';",
    "toString.call(value) === '[object Object]';",
    "const toString = (v: unknown) => String(v); toString.call(value) === '[object Object]';",
    "let toString = Object.prototype.toString; toString = other; toString.call(value) === '[object Object]';",
    // Other prototypes, or a prototype that is not read with `Object.getPrototypeOf`.
    'Object.getPrototypeOf(value) === Array.prototype;',
    'Object.getPrototypeOf(value) === null;',
    'Object.getPrototypeOf(value) !== Object.prototype.constructor;',
    'Foo.prototype === Object.prototype;',
    'value.__proto__ === Object.prototype;',
    'Object.getPrototypeOf(...args) === Object.prototype;',
    'const proto = getProto(value); proto === Object.prototype;',
    'let proto = Object.getPrototypeOf(value); proto = other; proto === Object.prototype;',
    'function f(proto) { return proto === Object.prototype; }',
    // Other constructors.
    'value.constructor === Array;',
    "value.constructor.name === 'Object';",
    'value[constructor] === Object;',
    'value.constructor === window.Object;',
    // A test assertion reads better with a matcher.
    'expect(Object.getPrototypeOf(value) === Object.prototype).toBe(true);',
    // The code already has its own `isPlainObject`.
    'const isPlainObject = (v: object) => Object.getPrototypeOf(v) === Object.prototype;',
    `function isPlainObject(value) {
      if (typeof value !== 'object' || value === null) return false;
      const prototype = Object.getPrototypeOf(value);
      return prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null;
    }`,
  ],
  invalid: [
    // toString tag
    {
      code: "Object.prototype.toString.call(value) === '[object Object]';",
      errors,
    },
    {
      code: "Object.prototype.toString.call(value) == '[object Object]';",
      errors,
    },
    {
      code: "Object.prototype.toString.call(value) !== '[object Object]';",
      errors,
    },
    {
      code: '"[object Object]" === Object.prototype.toString.call(value);',
      errors,
    },
    { code: "({}).toString.call(value) === '[object Object]';", errors },
    {
      code: "const toString = Object.prototype.toString; toString.call(value) === '[object Object]';",
      errors,
    },
    {
      code: "const objToString = {}.toString; objToString.call(value) !== '[object Object]';",
      errors,
    },
    {
      code: "const { toString } = Object.prototype; toString.call(value) === '[object Object]';",
      errors,
    },
    {
      code: "if (runtimeTheme && Object.prototype.toString.call(runtimeTheme) === '[object Object]') apply(runtimeTheme);",
      errors,
    },
    // Object.getPrototypeOf
    { code: 'Object.getPrototypeOf(value) === Object.prototype;', errors },
    { code: 'Object.prototype === Object.getPrototypeOf(value);', errors },
    { code: 'Object.getPrototypeOf(value) !== Object.prototype;', errors },
    {
      code: 'Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null;',
      errors,
    },
    {
      code: 'Object.getPrototypeOf(value) === null || Object.getPrototypeOf(value) === Object.prototype;',
      errors,
    },
    {
      code: 'Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null;',
      errors,
    },
    {
      code: 'const proto = Object.getPrototypeOf(value); if (proto === Object.prototype || proto === null) copy(value);',
      errors,
    },
    {
      code: 'function restore(row) { const proto = Object.getPrototypeOf(row); return proto === Object.prototype ? undefined : row; }',
      errors,
    },
    {
      code: 'Object.getPrototypeOf(a) === Object.prototype || Object.getPrototypeOf(b) === null;',
      errors,
    },
    {
      code: "if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) walk(value);",
      errors,
    },
    // constructor
    { code: 'value.constructor === Object;', errors },
    { code: 'value?.constructor === Object;', errors },
    { code: 'Object !== value.constructor;', errors },
    { code: 'if (obj && obj.constructor == Object) merge(obj);', errors },
    {
      code: 'function f(v: unknown): boolean { return (v as object).constructor === Object; }',
      errors,
    },
    {
      code: 'import { isPlainObject } from "es-toolkit"; value.constructor === Object;',
      errors,
    },
    {
      code: 'a.constructor === Object && b.constructor === Object;',
      errors: [...errors, ...errors],
    },
  ],
});
