// `xs?.filter(…)` receivers, which a rewrite would dereference

import type { TSESTree } from '@typescript-eslint/utils';

// `xs?.filter(f)`, `a?.b.filter(f)` or `xs.filter?.(f)` short-circuits to `undefined`, while a
// rewrite such as `without(xs, v)` would throw on a nil receiver.
export const isOptionalCall = (node: TSESTree.CallExpression) => {
  let link: TSESTree.Node = node;
  for (;;) {
    switch (link.type) {
      case 'CallExpression':
        if (link.optional) return true;
        link = link.callee;
        break;
      case 'MemberExpression':
        if (link.optional) return true;
        link = link.object;
        break;
      case 'TSNonNullExpression':
        link = link.expression;
        break;
      default:
        return false;
    }
  }
};
