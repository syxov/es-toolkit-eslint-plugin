import type { TSESTree } from '@typescript-eslint/utils';
import { isLiteralValue } from './ast.js';

type CaseMethod = 'toLowerCase' | 'toUpperCase';

// `a + b` or `${a}${b}` (an untagged template with nothing but the two expressions).
export const joinedHalves =
  ':matches(BinaryExpression[operator="+"], TemplateLiteral:not(TaggedTemplateExpression > .quasi)[expressions.length=2][quasis.0.value.raw=""][quasis.1.value.raw=""][quasis.2.value.raw=""])';

export type JoinedHalves = TSESTree.BinaryExpression | TSESTree.TemplateLiteral;

export const halvesOf = (node: JoinedHalves): TSESTree.Node[] =>
  node.type === 'BinaryExpression' ? [node.left, node.right] : node.expressions;

// The receiver of `<recv>.<method>(<literal args>)`, else null.
const receiverOf = (
  node: TSESTree.Node,
  method: string,
  args: readonly number[],
): TSESTree.Expression | null =>
  node.type === 'CallExpression'
  && node.callee.type === 'MemberExpression'
  && !node.callee.computed
  && node.callee.property.type === 'Identifier'
  && node.callee.property.name === method
  && node.arguments.length === args.length
  && node.arguments.every((arg, i) => isLiteralValue(arg, args[i]))
    ? node.callee.object
    : null;

// The receiver of `<recv>.charAt(0).<method>()` or `<recv>[0].<method>()`, else null.
export const casedFirstChar = (
  node: TSESTree.Node,
  method: CaseMethod,
): TSESTree.Expression | null => {
  const target = receiverOf(node, method, []);
  if (!target) return null;
  if (target.type === 'MemberExpression')
    return target.computed && isLiteralValue(target.property, 0)
      ? target.object
      : null;
  return receiverOf(target, 'charAt', [0]);
};

// The receiver of `<recv>.slice(1)` or `<recv>.substring(1)`, else null.
export const restFrom = (node: TSESTree.Node): TSESTree.Expression | null =>
  receiverOf(node, 'slice', [1]) ?? receiverOf(node, 'substring', [1]);

// The receiver of `<recv>.slice(1).<method>()` or `<recv>.substring(1).<method>()`, else null.
export const casedRest = (
  node: TSESTree.Node,
  method: CaseMethod,
): TSESTree.Expression | null => {
  const rest = receiverOf(node, method, []);
  return rest && restFrom(rest);
};
