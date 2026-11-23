import type { TSESTree } from '@typescript-eslint/utils';

const stringNames =
  /^(content|description|html|id|key|label|line|markdown|message|name|str|string|text|title|type|url)$/;
const stringSuffixes = /(Html|Message|Name|Str|String|Text|Title|Url)$/;

// An identifier or property named like a single string (`text`, `expose.type`, `fileName`):
// without types, the name is the only hint that `text.slice` or `type.includes` works on a
// string. Plural names (`names`, `types`) are left to be arrays.
export const hasStringName = (node: TSESTree.Node) => {
  const name =
    node.type === 'Identifier'
      ? node.name
      : node.type === 'MemberExpression'
          && !node.computed
          && node.property.type === 'Identifier'
        ? node.property.name
        : undefined;
  return (
    name !== undefined && (stringNames.test(name) || stringSuffixes.test(name))
  );
};
