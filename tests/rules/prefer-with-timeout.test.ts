import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferWithTimeout } from '../../src/rules/prefer-with-timeout.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-with-timeout', preferWithTimeout, {
  valid: [
    "import { withTimeout } from 'es-toolkit'; withTimeout(fetchData, 1000);",
    'Promise.race([a, b]);',
    'Promise.race(promises);',
    'Promise.any([p, new Promise((_, reject) => setTimeout(reject, ms))]);',
    // Resolving after a delay is a soft deadline, not a timeout error.
    'Promise.race([p, new Promise((resolve) => setTimeout(resolve, ms))]);',
    'Promise.race([p, delay(ms)]);',
    // Three entries, a spread or a hole do not map onto `withTimeout(run, ms)`.
    'Promise.race([a, b, new Promise((_, reject) => setTimeout(reject, ms))]);',
    'Promise.race([...ps, new Promise((_, reject) => setTimeout(reject, ms))]);',
    'Promise.race([, new Promise((_, reject) => setTimeout(reject, ms))]);',
    // Both entries are timers.
    'Promise.race([new Promise((_, reject) => setTimeout(reject, a)), new Promise((_, reject) => setTimeout(reject, b))]);',
    // A `timeout` that is not es-toolkit's: often a local sleep.
    'Promise.race([p, timeout(ms)]);',
    'const timeout = (ms) => new Promise((r) => setTimeout(r, ms)); Promise.race([p, timeout(ms)]);',
    "import { timeout } from './utils'; Promise.race([p, timeout(ms)]);",
    "import { timeout } from 'es-toolkit'; Promise.race([p, timeout()]);",
    // The timer promise does more than reject after `ms`.
    'Promise.race([p, new Promise((_, reject) => { timer = setTimeout(reject, ms); })]);',
    'Promise.race([p, new Promise((resolve, reject) => setTimeout(() => resolve(reject()), ms))]);',
    'Promise.race([p, new Promise((_, reject) => setTimeout(() => { log(); reject(); }, ms))]);',
    'other.race([p, new Promise((_, reject) => setTimeout(reject, ms))]);',
    // Serialised and run in the browser page, where an imported `withTimeout` does not exist.
    'await page.evaluate(() => Promise.race([p, new Promise((_, reject) => setTimeout(reject, 100))]));',
  ],
  invalid: [
    {
      code: 'Promise.race([fetchData(), new Promise((_, reject) => setTimeout(reject, 1000))]);',
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: 'Promise.race([new Promise((_, reject) => setTimeout(reject, ms)), fetchData()]);',
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      // Inside a race the rejection value does not change what the code means.
      code: 'await Promise.race([runTest(), new Promise((_, reject) => setTimeout(() => reject(new Error(`Test timed out (${name}).`)), ms))]);',
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: "Promise.race([live.close().catch(() => {}), new Promise<void>((_, reject) => setTimeout(() => reject(new Error('close')), 5000))]);",
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: 'Promise.race([p, new Promise(function (resolve, reject) { setTimeout(function () { reject(err); }, ms); })]);',
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: 'Promise.race([p, new Promise((_, reject) => { setTimeout(() => reject(), ms); })]);',
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: "import { timeout } from 'es-toolkit'; await Promise.race([p, timeout(1000)]);",
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: "import { timeout as expire } from 'es-toolkit/promise'; Promise.race([expire(ms, { signal }), p]);",
      errors: [{ messageId: 'preferWithTimeout' }],
    },
    {
      code: 'async function load<T>(p: Promise<T>): Promise<T> { return Promise.race([p, new Promise<never>((_, reject) => setTimeout(reject, 10))]); }',
      errors: [{ messageId: 'preferWithTimeout' }],
    },
  ],
});
