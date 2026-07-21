import { preferCapitalize } from './rules/prefer-capitalize.js';
import { preferClamp } from './rules/prefer-clamp.js';
import { preferCompact } from './rules/prefer-compact.js';
import { preferDelay } from './rules/prefer-delay.js';
import { preferIsDate } from './rules/prefer-is-date.js';
import { preferDifference } from './rules/prefer-difference.js';
import { preferFlatMap } from './rules/prefer-flat-map.js';
import { preferFlatMapDeep } from './rules/prefer-flat-map-deep.js';
import { preferFlatten } from './rules/prefer-flatten.js';
import { preferFlattenDeep } from './rules/prefer-flatten-deep.js';
import { preferIntersection } from './rules/prefer-intersection.js';
import { preferHead } from './rules/prefer-head.js';
import { preferIsEmpty } from './rules/prefer-is-empty.js';
import { preferIsEqual } from './rules/prefer-is-equal.js';
import { preferIsError } from './rules/prefer-is-error.js';
import { preferIsFunction } from './rules/prefer-is-function.js';
import { preferIsMap } from './rules/prefer-is-map.js';
import { preferIsBoolean } from './rules/prefer-is-boolean.js';
import { preferIsBlob } from './rules/prefer-is-blob.js';
import { preferIsFile } from './rules/prefer-is-file.js';
import { preferIsArrayBuffer } from './rules/prefer-is-array-buffer.js';
import { preferIsNil } from './rules/prefer-is-nil.js';
import { preferIsNotNil } from './rules/prefer-is-not-nil.js';
import { preferIsNull } from './rules/prefer-is-null.js';
import { preferIsNumber } from './rules/prefer-is-number.js';
import { preferIsRegExp } from './rules/prefer-is-reg-exp.js';
import { preferIsSet } from './rules/prefer-is-set.js';
import { preferIsString } from './rules/prefer-is-string.js';
import { preferIsSymbol } from './rules/prefer-is-symbol.js';
import { preferIsTypedArray } from './rules/prefer-is-typed-array.js';
import { preferIsUndefined } from './rules/prefer-is-undefined.js';
import { preferIsWeakMap } from './rules/prefer-is-weak-map.js';
import { preferIsWeakSet } from './rules/prefer-is-weak-set.js';
import { preferInitial } from './rules/prefer-initial.js';
import { preferInRange } from './rules/prefer-in-range.js';
import { preferLast } from './rules/prefer-last.js';
import { preferLowerFirst } from './rules/prefer-lower-first.js';
import { preferMean } from './rules/prefer-mean.js';
import { preferMeanBy } from './rules/prefer-mean-by.js';
import { preferRandomInt } from './rules/prefer-random-int.js';
import { preferRange } from './rules/prefer-range.js';
import { preferSample } from './rules/prefer-sample.js';
import { preferSum } from './rules/prefer-sum.js';
import { preferSumBy } from './rules/prefer-sum-by.js';
import { preferTail } from './rules/prefer-tail.js';
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
    'prefer-is-date': preferIsDate,
    'prefer-difference': preferDifference,
    'prefer-flat-map': preferFlatMap,
    'prefer-flat-map-deep': preferFlatMapDeep,
    'prefer-flatten': preferFlatten,
    'prefer-flatten-deep': preferFlattenDeep,
    'prefer-head': preferHead,
    'prefer-intersection': preferIntersection,
    'prefer-is-empty': preferIsEmpty,
    'prefer-is-equal': preferIsEqual,
    'prefer-is-error': preferIsError,
    'prefer-is-function': preferIsFunction,
    'prefer-is-map': preferIsMap,
    'prefer-is-boolean': preferIsBoolean,
    'prefer-is-blob': preferIsBlob,
    'prefer-is-file': preferIsFile,
    'prefer-is-array-buffer': preferIsArrayBuffer,
    'prefer-is-nil': preferIsNil,
    'prefer-is-not-nil': preferIsNotNil,
    'prefer-is-null': preferIsNull,
    'prefer-is-number': preferIsNumber,
    'prefer-is-reg-exp': preferIsRegExp,
    'prefer-is-set': preferIsSet,
    'prefer-is-string': preferIsString,
    'prefer-is-symbol': preferIsSymbol,
    'prefer-is-typed-array': preferIsTypedArray,
    'prefer-is-undefined': preferIsUndefined,
    'prefer-is-weak-map': preferIsWeakMap,
    'prefer-is-weak-set': preferIsWeakSet,
    'prefer-initial': preferInitial,
    'prefer-in-range': preferInRange,
    'prefer-last': preferLast,
    'prefer-lower-first': preferLowerFirst,
    'prefer-mean': preferMean,
    'prefer-mean-by': preferMeanBy,
    'prefer-random-int': preferRandomInt,
    'prefer-range': preferRange,
    'prefer-sample': preferSample,
    'prefer-sum': preferSum,
    'prefer-sum-by': preferSumBy,
    'prefer-tail': preferTail,
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
      'es-toolkit/prefer-is-date': 'error',
      'es-toolkit/prefer-head': 'error',
      'es-toolkit/prefer-flat-map': 'error',
      'es-toolkit/prefer-flat-map-deep': 'error',
      'es-toolkit/prefer-flatten': 'error',
      'es-toolkit/prefer-flatten-deep': 'error',
      'es-toolkit/prefer-is-empty': 'error',
      'es-toolkit/prefer-is-equal': 'error',
      'es-toolkit/prefer-is-error': 'error',
      'es-toolkit/prefer-is-function': 'error',
      'es-toolkit/prefer-is-map': 'error',
      'es-toolkit/prefer-is-boolean': 'error',
      'es-toolkit/prefer-is-blob': 'error',
      'es-toolkit/prefer-is-file': 'error',
      'es-toolkit/prefer-is-array-buffer': 'error',
      'es-toolkit/prefer-is-nil': 'error',
      'es-toolkit/prefer-is-not-nil': 'error',
      'es-toolkit/prefer-is-null': 'error',
      'es-toolkit/prefer-is-number': 'error',
      'es-toolkit/prefer-is-reg-exp': 'error',
      'es-toolkit/prefer-is-set': 'error',
      'es-toolkit/prefer-is-string': 'error',
      'es-toolkit/prefer-is-symbol': 'error',
      'es-toolkit/prefer-is-typed-array': 'error',
      'es-toolkit/prefer-is-undefined': 'error',
      'es-toolkit/prefer-is-weak-map': 'error',
      'es-toolkit/prefer-is-weak-set': 'error',
      'es-toolkit/prefer-initial': 'error',
      'es-toolkit/prefer-in-range': 'error',
      'es-toolkit/prefer-last': 'error',
      'es-toolkit/prefer-lower-first': 'error',
      'es-toolkit/prefer-random-int': 'error',
      'es-toolkit/prefer-range': 'error',
      'es-toolkit/prefer-sample': 'error',
      'es-toolkit/prefer-union': 'error',
      'es-toolkit/prefer-uniq': 'error',
      'es-toolkit/prefer-upper-first': 'error',
      'es-toolkit/prefer-tail': 'error',
    },
  },
  'array-methods': {
    plugins: { 'es-toolkit': plugin },
    rules: {
      'es-toolkit/prefer-compact': 'error',
      'es-toolkit/prefer-difference': 'error',
      'es-toolkit/prefer-intersection': 'error',
      'es-toolkit/prefer-mean': 'error',
      'es-toolkit/prefer-mean-by': 'error',
      'es-toolkit/prefer-sum': 'error',
      'es-toolkit/prefer-sum-by': 'error',
      'es-toolkit/prefer-without': 'error',
    },
  },
};

export default plugin;
