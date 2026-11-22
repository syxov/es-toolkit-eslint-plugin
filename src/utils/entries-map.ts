import type { TSESTree } from '@typescript-eslint/utils';

// Fragments for `xs.map(cb)` calls whose callback returns a `[key, value]` entry. In every
// fragment `path` is the attribute prefix of the matched node ('' for the selector subject,
// otherwise ending in a dot).

// `Object.fromEntries(entries)` with a single argument; fragments for it go on `arguments.0.`.
export const objectFromEntries =
  'CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.object.name="Object"][callee.property.name="fromEntries"][arguments.length=1]';

// `xs.map(cb)` without a `thisArg`.
export const mapCall = (path: string) =>
  `[${path}type="CallExpression"][${path}callee.type="MemberExpression"][${path}callee.computed=false][${path}callee.property.name="map"][${path}arguments.length=1]`;

// A callback whose returned value matches `returned`, either as an expression-bodied arrow
// or from a body made of a single `return`.
export const returningCallback = (
  path: string,
  returned: (path: string) => string,
) =>
  `[${path}type=/^(ArrowFunctionExpression|FunctionExpression)$/]:matches(${returned(`${path}body.`)}, [${path}body.body.length=1][${path}body.body.0.type="ReturnStatement"]${returned(`${path}body.body.0.argument.`)})`;

// A one-parameter `returningCallback`.
export const entryCallback = (
  path: string,
  returned: (path: string) => string,
) => `${returningCallback(path, returned)}[${path}params.length=1]`;

// The value an `entryCallback` returns, or null for any other body.
export const returnedExpression = (
  body: TSESTree.BlockStatement | TSESTree.Expression,
) => {
  if (body.type !== 'BlockStatement') return body;
  const [statement] = body.body;
  return statement.type === 'ReturnStatement' ? statement.argument : null;
};
