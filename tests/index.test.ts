import { expect, test } from 'vitest';
import plugin from '../src/index.js';

const categoryNames = [
  'array',
  'function',
  'math',
  'object',
  'predicate',
  'promise',
  'string',
] as const;

test('exports category configs and an all config', () => {
  expect(Object.keys(plugin.configs)).toEqual([...categoryNames, 'all']);

  expect(plugin.configs.array.rules).toMatchObject({
    'es-toolkit/prefer-compact': 'error',
    'es-toolkit/prefer-head': 'error',
    'es-toolkit/prefer-without': 'error',
  });
  expect(plugin.configs.math.rules).toMatchObject({
    'es-toolkit/prefer-clamp': 'error',
    'es-toolkit/prefer-mean': 'error',
    'es-toolkit/prefer-sum-by': 'error',
  });
  expect(plugin.configs.predicate.rules).toMatchObject({
    'es-toolkit/prefer-is-empty': 'error',
    'es-toolkit/prefer-is-nil': 'error',
    'es-toolkit/prefer-is-string': 'error',
  });
  expect(plugin.configs.promise.rules).toEqual({
    'es-toolkit/prefer-delay': 'error',
  });
  expect(plugin.configs.string.rules).toEqual({
    'es-toolkit/prefer-capitalize': 'error',
    'es-toolkit/prefer-escape-reg-exp': 'error',
    'es-toolkit/prefer-lower-first': 'error',
    'es-toolkit/prefer-upper-first': 'error',
  });
});

test('partitions every rule into exactly one category', () => {
  const categorizedRuleNames = categoryNames.flatMap(categoryName =>
    Object.keys(plugin.configs[categoryName].rules),
  );
  const registeredRuleNames = Object.keys(plugin.rules).map(
    ruleName => `es-toolkit/${ruleName}`,
  );

  expect(new Set(categorizedRuleNames).size).toBe(categorizedRuleNames.length);
  expect(categorizedRuleNames.toSorted()).toEqual(
    registeredRuleNames.toSorted(),
  );
});

test('all config combines every category config', () => {
  const categoryRules = Object.fromEntries(
    categoryNames.flatMap(categoryName =>
      Object.entries(plugin.configs[categoryName].rules),
    ),
  );

  expect(plugin.configs.all.rules).toEqual(categoryRules);
  expect(
    Object.values(plugin.configs).every(
      config => config.plugins?.['es-toolkit'] === plugin,
    ),
  ).toBe(true);
});

test('meta mirrors package.json', async () => {
  const { default: packageJson } = await import('../package.json', {
    with: { type: 'json' },
  });

  expect(plugin.meta).toEqual({
    name: packageJson.name,
    version: packageJson.version,
  });
});
