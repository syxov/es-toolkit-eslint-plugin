import { preferCapitalize } from './rules/prefer-capitalize.js';
import { preferClamp } from './rules/prefer-clamp.js';
import { preferCompact } from './rules/prefer-compact.js';
import { preferDelay } from './rules/prefer-delay.js';
import { preferDifference } from './rules/prefer-difference.js';
import { preferIntersection } from './rules/prefer-intersection.js';
import { preferIsEmpty } from './rules/prefer-is-empty.js';
import { preferIsEqual } from './rules/prefer-is-equal.js';
import { preferLast } from './rules/prefer-last.js';
import { preferMean } from './rules/prefer-mean.js';
import { preferRandomInt } from './rules/prefer-random-int.js';
import { preferRange } from './rules/prefer-range.js';
import { preferSample } from './rules/prefer-sample.js';
import { preferSum } from './rules/prefer-sum.js';
import { preferUnion } from './rules/prefer-union.js';
import { preferUniq } from './rules/prefer-uniq.js';
import { preferUpperFirst } from './rules/prefer-upper-first.js';
import { preferWithout } from './rules/prefer-without.js';

const plugin = {
  meta: { name: 'es-toolkit-eslint-plugin', version: '1.0.0' },
  rules: {
    'prefer-capitalize': preferCapitalize,
    'prefer-clamp': preferClamp,
    'prefer-compact': preferCompact,
    'prefer-delay': preferDelay,
    'prefer-difference': preferDifference,
    'prefer-intersection': preferIntersection,
    'prefer-is-empty': preferIsEmpty,
    'prefer-is-equal': preferIsEqual,
    'prefer-last': preferLast,
    'prefer-mean': preferMean,
    'prefer-random-int': preferRandomInt,
    'prefer-range': preferRange,
    'prefer-sample': preferSample,
    'prefer-sum': preferSum,
    'prefer-union': preferUnion,
    'prefer-uniq': preferUniq,
    'prefer-upper-first': preferUpperFirst,
    'prefer-without': preferWithout,
  },
  configs: {},
};

plugin.configs = {
  utilities: {
    plugins: { 'es-toolkit': plugin },
    rules: {
      'es-toolkit/prefer-capitalize': 'error',
      'es-toolkit/prefer-clamp': 'error',
      'es-toolkit/prefer-delay': 'error',
      'es-toolkit/prefer-is-empty': 'error',
      'es-toolkit/prefer-is-equal': 'error',
      'es-toolkit/prefer-last': 'error',
      'es-toolkit/prefer-random-int': 'error',
      'es-toolkit/prefer-range': 'error',
      'es-toolkit/prefer-sample': 'error',
      'es-toolkit/prefer-union': 'error',
      'es-toolkit/prefer-uniq': 'error',
      'es-toolkit/prefer-upper-first': 'error',
    },
  },
  'array-methods': {
    plugins: { 'es-toolkit': plugin },
    rules: {
      'es-toolkit/prefer-compact': 'error',
      'es-toolkit/prefer-difference': 'error',
      'es-toolkit/prefer-intersection': 'error',
      'es-toolkit/prefer-mean': 'error',
      'es-toolkit/prefer-sum': 'error',
      'es-toolkit/prefer-without': 'error',
    },
  },
};

export default plugin;
