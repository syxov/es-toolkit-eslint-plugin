import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferTimeout } from '../../src/rules/prefer-timeout.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-timeout', preferTimeout, {
  valid: [
    'timeout(1000);',
    // Resolving after a delay belongs to prefer-delay.
    'new Promise((resolve) => setTimeout(resolve, ms));',
    'new Promise((resolve, reject) => setTimeout(resolve, ms));',
    'new Promise((resolve, reject) => setTimeout(() => resolve(), ms));',
    // A single-param executor names the resolve function, whatever it is called.
    'new Promise((reject) => setTimeout(reject, ms));',
    // The executor uses `resolve`, so it can settle both ways.
    'new Promise((resolve, reject) => { setTimeout(reject, ms); resolve(); });',
    'new Promise((resolve, reject) => setTimeout(() => reject(resolve), ms));',
    'new Promise((resolve, reject) => setTimeout(reject, resolve));',
    // The executor does more than arm one timer.
    'new Promise((_, reject) => { doWork(); setTimeout(reject, ms); });',
    'new Promise((_, reject) => { timer = setTimeout(reject, ms); });',
    'new Promise((_, reject) => { const id = setTimeout(reject, ms); onAbort(() => clearTimeout(id)); });',
    // The callback does more than reject.
    'new Promise((_, reject) => setTimeout(() => { cleanup(); reject(); }, ms));',
    'new Promise((_, reject) => setTimeout(() => other(), ms));',
    'new Promise((_, reject) => setTimeout(() => obj.reject(), ms));',
    'new Promise((_, reject) => setTimeout((x) => reject(x), ms));',
    'new Promise((_, reject) => setTimeout(() => reject(a, b), ms));',
    'new Promise((_, reject) => setTimeout(doWork, ms));',
    'new Promise((_, reject) => setTimeout(reject));',
    'new Promise(({ resolve }, reject) => setTimeout(reject, ms));',
    'new Other((_, reject) => setTimeout(reject, ms));',
    // A failure simulated after a delay: `timeout` would replace the error.
    "new Promise((_, reject) => setTimeout(() => reject(new Error('Failed')), 0));",
    "new Promise((_, reject) => { setTimeout(() => reject(new Error('Error fetching data')), 500); });",
    'new Promise((_, reject) => setTimeout(reject, ms, error));',
    'new Promise((_, reject) => setTimeout(() => reject(error), ms));',
    // Raced against another promise: prefer-with-timeout owns it.
    'Promise.race([fetchData(), new Promise((_, reject) => setTimeout(reject, ms))]);',
    "Promise.race([new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)), load()]);",
    // Serialised and run in the browser page, where an imported `timeout` does not exist.
    'await page.evaluate(() => new Promise((_, reject) => setTimeout(reject, 100)));',
  ],
  invalid: [
    {
      code: 'new Promise((_, reject) => setTimeout(reject, 1000));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise((resolve, reject) => setTimeout(reject, 5));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise((_, reject) => setTimeout(() => reject(), ms));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise((_, reject) => setTimeout(() => { reject(); }, ms));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise((_, reject) => { setTimeout(reject, ms); });',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise(function (resolve, reject) { setTimeout(function () { reject(); }, ms); });',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      // The rejection says it timed out, so `TimeoutError` keeps the meaning.
      code: "new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));",
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'new Promise((_, reject) => setTimeout(() => reject(new TimeoutError()), ms));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: "new Promise((_, reject) => setTimeout(() => reject('timeout'), ms));",
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: "new Promise((_, reject) => setTimeout(reject, ms, new Error('time-out')));",
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      code: 'const expire = (ms: number) => new Promise<never>((_, reject) => setTimeout(reject, ms));',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      // A race with three entries is not a `withTimeout` call.
      code: 'Promise.race([a, b, new Promise((_, reject) => setTimeout(reject, ms))]);',
      errors: [{ messageId: 'preferTimeout' }],
    },
    {
      // Two timers raced against each other are not a `withTimeout` call either.
      code: 'Promise.race([new Promise((_, reject) => setTimeout(reject, a)), new Promise((_, reject) => setTimeout(reject, b))]);',
      errors: [{ messageId: 'preferTimeout' }, { messageId: 'preferTimeout' }],
    },
    {
      code: 'const t = new Promise((_, reject) => setTimeout(reject, ms)); await Promise.race([p, t]);',
      errors: [{ messageId: 'preferTimeout' }],
    },
  ],
});
