import type { TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';

// `Array.from(…)`, `Object.keys(…)` and `Object.values(…)` always return arrays.
const isArrayFactory = (callee: TSESTree.Node) =>
  callee.type === 'MemberExpression'
  && !callee.computed
  && (isIdentifierNamed(callee.object, 'Array')
    ? isIdentifierNamed(callee.property, 'from')
    : isIdentifierNamed(callee.object, 'Object')
      && /^(keys|values)$/.test(callee.property.name));

// The `includes` receiver is, or may well be, a string: `.includes` is then a substring test,
// not array membership. Call results are skipped unless they are known to be arrays.
export const isStringLikeReceiver = (node: TSESTree.Node) =>
  (node.type === 'Literal' && typeof node.value === 'string')
  || node.type === 'TemplateLiteral'
  || (node.type === 'CallExpression' && !isArrayFactory(node.callee));
