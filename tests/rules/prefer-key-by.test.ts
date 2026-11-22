import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferKeyBy } from '../../src/rules/prefer-key-by.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-key-by', preferKeyBy, {
  valid: [
    'keyBy(users, u => u.id);',
    'Object.fromEntries(entries);',
    'Object.fromEntries();',
    // The value is not the element itself.
    'Object.fromEntries(users.map(u => [u.id, u.name]));',
    'Object.fromEntries(users.map(u => [u.id, u.id]));',
    'Object.fromEntries(users.map(u => [u.id, v]));',
    'Object.fromEntries(users.map(u => [u.id, ...u]));',
    'Object.fromEntries(users.map(u => [u.id, { ...u }]));',
    // The key does not read the parameter, or is the parameter itself.
    'Object.fromEntries(users.map(u => [u, u]));',
    'Object.fromEntries(users.map(u => [key, u]));',
    "Object.fromEntries(users.map(u => ['id', u]));",
    'Object.fromEntries(users.map(u => [v.id, u]));',
    // The callback parameter is not a single plain identifier.
    'Object.fromEntries(users.map((u, i) => [i, u]));',
    'Object.fromEntries(users.map(({ id }) => [id, id]));',
    'Object.fromEntries(users.map((...u) => [u.length, u]));',
    'Object.fromEntries(users.map((u = fallback) => [u.id, u]));',
    'Object.fromEntries(users.map(() => [id, user]));',
    // The returned value is not a two-element array.
    'Object.fromEntries(users.map(u => [u.id, u, extra]));',
    'Object.fromEntries(users.map(u => [u.id]));',
    'Object.fromEntries(users.map(u => ({ key: u.id, value: u })));',
    'Object.fromEntries(users.map(toEntry));',
    // `.map` has a `thisArg` or is not the direct argument.
    'Object.fromEntries(users.map(u => [u.id, u], thisArg));',
    'Object.fromEntries(users.map(u => [u.id, u]).filter(Boolean));',
    // A different method or callee.
    'Object.fromEntries(users.flatMap(u => [u.id, u]));',
    'Object.fromEntries(users.forEach(u => [u.id, u]));',
    'foo.fromEntries(users.map(u => [u.id, u]));',
    'fromEntries(users.map(u => [u.id, u]));',
    'Object.entries(users.map(u => [u.id, u]));',
    // A Map, not an object.
    'new Map(users.map(u => [u.id, u]));',
    // Owned by prefer-uniq-by.
    '[...new Map(users.map(u => [u.id, u])).values()];',
    // Owned by prefer-map-values.
    'Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));',
  ],
  invalid: [
    {
      code: 'Object.fromEntries(users.map(u => [u.id, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map((u) => [u.id.toString(), u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map(u => [getKey(u), u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map(u => [`${u.type}:${u.id}`, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: "Object.fromEntries(users.map(u => [u['id'], u]));",
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map(u => [u.id + suffix, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map(function (u) { return [u.id, u]; }));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map(u => { return [u.id, u]; }));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.filter(isActive).map(u => [u.id, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'const byId = Object.fromEntries(users.map(u => [u.id, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'function index(users) { return Object.fromEntries(users.map(u => [u.id, u])); }',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'render(Object.fromEntries(users.map(u => [u.id, u])));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: [
        'const usersById = Object.fromEntries(users.map(u => [u.id, u]));',
        'const postsBySlug = Object.fromEntries(posts.map(p => [p.slug, p]));',
      ].join('\n'),
      errors: [{ messageId: 'preferKeyBy' }, { messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries(users.map((u: User) => [u.id, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'const byId = Object.fromEntries(users.map(u => [u.id, u])) as Record<string, User>;',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'Object.fromEntries<User>(users.map(function (u: User) { return [u.id, u]; }));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
    {
      code: 'const byId: Record<string, User> = Object.fromEntries(users.map((u: User): [string, User] => [u.id, u]));',
      errors: [{ messageId: 'preferKeyBy' }],
    },
  ],
});
