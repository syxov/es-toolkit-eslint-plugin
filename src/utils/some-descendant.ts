import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

const isNode = (value: unknown): value is TSESTree.Node =>
  typeof value === 'object'
  && value !== null
  && typeof (value as { type?: unknown }).type === 'string';

// `root` or a node below it satisfies `predicate` (a depth-first walk over the AST).
export const someDescendant = (
  sourceCode: Readonly<TSESLint.SourceCode>,
  root: TSESTree.Node,
  predicate: (node: TSESTree.Node) => boolean,
) => {
  const stack: TSESTree.Node[] = [root];
  for (let node = stack.pop(); node; node = stack.pop()) {
    if (predicate(node)) return true;
    for (const key of sourceCode.visitorKeys[node.type] ?? []) {
      const value: unknown = (node as unknown as Record<string, unknown>)[key];
      for (const child of Array.isArray(value) ? value : [value])
        if (isNode(child)) stack.push(child);
    }
  }
  return false;
};
