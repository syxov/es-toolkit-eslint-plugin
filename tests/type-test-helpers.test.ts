import { readdirSync, readFileSync } from 'node:fs';
import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import plugin from '../src/index.js';
import { typeTestHelpers } from '../src/utils/type-test.js';

// `typeTestHelpers` lets other rules yield a type test to its predicate rule, so it must list
// exactly the tests those rules report.
const rulesDir = new URL('../src/rules/', import.meta.url);
const helpersPassedByRules = readdirSync(rulesDir)
  .map(file => readFileSync(new URL(file, rulesDir), 'utf8'))
  .flatMap(source =>
    [...source.matchAll(/isReplaceableTypeTest\([^)]*'(\w+)'\s*,?\s*\)/g)].map(
      ([, helper]) => helper,
    ),
  );

const linter = new Linter({ configType: 'flat' });
const config: Linter.Config[] = [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { 'es-toolkit': plugin },
    rules: Object.fromEntries(
      Object.keys(plugin.rules).map(name => [`es-toolkit/${name}`, 'error']),
    ),
  },
];

const kebab = (name: string) =>
  name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

const testCode = (type: string) => {
  const [kind, name] = type.split(' ');
  return kind === 'typeof'
    ? `const f = (v: unknown) => typeof v === '${name}';`
    : `const f = (v: unknown) => v instanceof ${name};`;
};

describe('typeTestHelpers', () => {
  it('lists every helper the type predicate rules pass', () => {
    expect([...helpersPassedByRules].sort()).toEqual(
      Object.values(typeTestHelpers).sort(),
    );
  });

  it.each(Object.entries(typeTestHelpers))(
    '%s is reported by the rule for %s',
    (type, helper) => {
      const rules = linter
        .verify(testCode(type), config, 'snippet.ts')
        .map(({ ruleId }) => ruleId);
      expect(rules).toEqual([`es-toolkit/prefer-${kebab(helper ?? '')}`]);
    },
  );
});
