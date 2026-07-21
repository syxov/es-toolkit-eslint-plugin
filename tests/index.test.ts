import { expect, test } from 'vitest';
import plugin from '../src/index.js';

test('exports separate utility and array-method configs', () => {
  expect(Object.keys(plugin.configs)).toEqual(['utilities', 'array-methods']);
  expect(plugin.configs.utilities.rules).not.toHaveProperty(
    'es-toolkit/prefer-compact',
  );
  expect(plugin.configs.utilities.rules).toMatchObject({
    'es-toolkit/prefer-head': 'error',
    'es-toolkit/prefer-initial': 'error',
    'es-toolkit/prefer-is-nil': 'error',
    'es-toolkit/prefer-is-string': 'error',
    'es-toolkit/prefer-lower-first': 'error',
    'es-toolkit/prefer-tail': 'error',
  });
  expect(plugin.configs['array-methods'].rules).toHaveProperty(
    'es-toolkit/prefer-compact',
  );
});
