// sites a predicate rule skips (`expect(typeof x === …)`, helper name taken)

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { isIdentifierNamed } from './ast.js';
import { bindsHelperName } from './scope.js';

type SourceCode = Readonly<TSESLint.SourceCode>;

// `expect(typeof x === 'function').toBe(true)`: a test assertion, better written with a
// matcher (`toBeTypeOf`, `toBeInstanceOf`, `toBeNull`) than with a predicate helper.
const isExpectArgument = (node: TSESTree.Node) =>
  node.parent?.type === 'CallExpression'
  && isIdentifierNamed(node.parent.callee, 'expect')
  && node.parent.arguments[0] === node;

// Reasons shared by every predicate rule to leave the hand-written check at `node` alone.
export const isExcludedPredicateSite = (
  sourceCode: SourceCode,
  node: TSESTree.Node,
  helper: string,
) => isExpectArgument(node) || bindsHelperName(sourceCode, node, helper);
