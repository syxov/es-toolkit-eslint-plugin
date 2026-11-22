import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferUniqBy } from '../../src/rules/prefer-uniq-by.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-uniq-by', preferUniqBy, {
  valid: [
    'uniqBy(users, (u) => u.id);',
    'uniqBy(users, (u: User) => u.id);',
    // The Map itself is kept, or its values are left as an iterator.
    'new Map(users.map((u) => [u.id, u]));',
    'new Map(users.map((u) => [u.id, u])).values();',
    'const it = new Map(users.map((u) => [u.id, u])).values();',
    '[...new Map(users.map((u) => [u.id, u]))];',
    'Array.from(new Map(users.map((u) => [u.id, u])));',
    // Not the values of the Map.
    '[...new Map(users.map((u) => [u.id, u])).keys()];',
    '[...new Map(users.map((u) => [u.id, u])).entries()];',
    'Array.from(new Map(users.map((u) => [u.id, u])).keys());',
    // The value is not the bare parameter.
    '[...new Map(users.map((u) => [u.id, u.name])).values()];',
    '[...new Map(users.map((u) => [u.id, other])).values()];',
    '[...new Map(users.map((u) => [u.id, ...u])).values()];',
    // The key does not read the parameter, or is the parameter itself.
    '[...new Map(users.map((u) => [key, u])).values()];',
    '[...new Map(users.map((u) => [other.id, u])).values()];',
    '[...new Map(users.map((u) => [u, u])).values()];',
    // Swapped pair: the parameter is the key.
    '[...new Map(users.map((u) => [u, u.id])).values()];',
    // The pair does not have exactly two elements.
    '[...new Map(users.map((u) => [u.id, u, extra])).values()];',
    '[...new Map(users.map((u) => [u])).values()];',
    // The callback does not take exactly one plain identifier parameter.
    '[...new Map(users.map((u, i) => [i, u])).values()];',
    '[...new Map(users.map((u, i) => [u.id, u])).values()];',
    '[...new Map(users.map(() => [id, u])).values()];',
    '[...new Map(users.map(({ id }) => [id, user])).values()];',
    '[...new Map(users.map((u = fallback) => [u.id, u])).values()];',
    '[...new Map(users.map((...u) => [u.id, u])).values()];',
    // `.map` with a `thisArg`, a callback reference, or another method.
    '[...new Map(users.map((u) => [u.id, u], ctx)).values()];',
    '[...new Map(users.map(toPair)).values()];',
    '[...new Map(users.flatMap((u) => [[u.id, u]])).values()];',
    '[...new Map(entries).values()];',
    // Not converted to a plain array of exactly the values.
    'Array.from(new Map(users.map((u) => [u.id, u])).values(), f);',
    '[x, ...new Map(users.map((u) => [u.id, u])).values()];',
    '[...new Map(users.map((u) => [u.id, u])).values(), x];',
    '[new Map(users.map((u) => [u.id, u])).values()];',
    'Array.of(new Map(users.map((u) => [u.id, u])).values());',
    'other.from(new Map(users.map((u) => [u.id, u])).values());',
    // Not a `new Map`.
    '[...new WeakMap(users.map((u) => [u.id, u])).values()];',
    '[...Map(users.map((u) => [u.id, u])).values()];',
    '[...map.values()];',
    // Owned by prefer-uniq and prefer-key-by.
    '[...new Set(arr)];',
    'Object.fromEntries(users.map((u) => [u.id, u]));',
  ],
  invalid: [
    {
      code: '[...new Map(users.map((u) => [u.id, u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'Array.from(new Map(users.map((u) => [u.id, u])).values());',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map(users.map((u) => [key(u), u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map(users.map((u) => [u.name.toLowerCase(), u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map(users.map((u) => [`${u.first}-${u.last}`, u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'Array.from(new Map(users.map((u) => [u[field], u])).values());',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map(users.map(function (u) { return [u.id, u]; })).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map(users.map((u) => { return [u.id, u]; })).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'Array.from(new Map(users.map(function (u) { return [key(u), u]; })).values());',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      // The receiver of `.map` may be any expression.
      code: '[...new Map(state.users.map((u) => [u.id, u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'const unique = [...new Map(users.map((u) => [u.id, u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'function dedupe(users) { return Array.from(new Map(users.map((u) => [u.id, u])).values()); }',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'render([...new Map(users.map((u) => [u.id, u])).values()]);',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map(users.map((u: User) => [u.id, u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: '[...new Map<string, User>(users.map((u) => [u.id, u])).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'const unique: User[] = Array.from(new Map<number, User>(users.map((u: User) => [u.id, u])).values());',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'const dedupe = (users: User[]): User[] => [...new Map(users.map(function (u: User) { return [u.email, u]; })).values()];',
      errors: [{ messageId: 'preferUniqBy' }],
    },
    {
      code: 'const a = [...new Map(xs.map((x) => [x.id, x])).values()]; const b = Array.from(new Map(ys.map((y) => [y.key, y])).values());',
      errors: [{ messageId: 'preferUniqBy' }, { messageId: 'preferUniqBy' }],
    },
  ],
});
