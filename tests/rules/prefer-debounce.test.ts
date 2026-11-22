import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferDebounce } from '../../src/rules/prefer-debounce.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-debounce', preferDebounce, {
  valid: [
    'const onInput = debounce(search, 300);',
    `
      const onInput = debounce(() => search(), 300);
      input.addEventListener('input', onInput);
    `,
    // Each half alone.
    'clearTimeout(t);',
    't = setTimeout(f, 100);',
    `
      clearTimeout(t);
      t = null;
    `,
    // Different handles.
    `
      clearTimeout(a);
      b = setTimeout(f, 100);
    `,
    `
      clearTimeout(this.timer);
      timer = setTimeout(f, 100);
    `,
    `
      clearTimeout(state.t);
      state.u = setTimeout(f, 100);
    `,
    // Reversed order.
    `
      t = setTimeout(f, 100);
      clearTimeout(t);
    `,
    // A declaration, not an assignment.
    `
      clearTimeout(t);
      const t2 = setTimeout(f, 100);
    `,
    // The assignment is not its own expression statement.
    `
      function schedule() {
        clearTimeout(t);
        return (t = setTimeout(f, 100));
      }
    `,
    `
      clearTimeout(t);
      t = wrap(setTimeout(f, 100));
    `,
    // Intervals are not a debounce.
    `
      clearInterval(t);
      t = setInterval(f, 100);
    `,
    `
      clearTimeout(t);
      t = setInterval(f, 100);
    `,
    `
      clearInterval(t);
      t = setTimeout(f, 100);
    `,
    // The guard does not test the bare cleared handle.
    `
      if (ready) clearTimeout(t);
      t = setTimeout(f, 100);
    `,
    `
      if (t != null) clearTimeout(t);
      t = setTimeout(f, 100);
    `,
    `
      if (!t) clearTimeout(t);
      t = setTimeout(f, 100);
    `,
    `
      if (t) clearTimeout(u);
      t = setTimeout(f, 100);
    `,
    // The guarded block does more than clear the timer.
    `
      if (t) {
        clearTimeout(t);
        log();
      }
      t = setTimeout(f, 100);
    `,
    // Different blocks.
    `
      if (x) {
        clearTimeout(t);
      }
      t = setTimeout(f, 100);
    `,
    `
      clearTimeout(t);
      if (x) {
        t = setTimeout(f, 100);
      }
    `,
    `
      clearTimeout(t);
      function later() {
        t = setTimeout(f, 100);
      }
    `,
    // Not the global timer functions.
    `
      foo.clearTimeout(t);
      t = foo.setTimeout(f, 100);
    `,
    `
      clearTimeout(t);
      t = timers.setTimeout(f, 100);
    `,
  ],
  invalid: [
    {
      code: `
        let timer;
        function onInput() {
          clearTimeout(timer);
          timer = setTimeout(() => search(), 300);
        }
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        const onInput = () => {
          clearTimeout(timer);
          timer = setTimeout(search, 300);
        };
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        const onInput = function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            search(query);
          }, delay);
        };
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        clearTimeout(t);
        t = setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        class Search {
          onInput() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.search(), 300);
          }
        }
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        function onResize() {
          clearTimeout(state.t);
          state.t = setTimeout(layout, 50);
        }
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        window.clearTimeout(t);
        t = window.setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        globalThis.clearTimeout(t);
        t = globalThis.setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        clearTimeout(t);
        t = window.setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    // A statement in between.
    {
      code: `
        clearTimeout(t);
        log();
        t = setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    // Guarded clears.
    {
      code: `
        if (t) clearTimeout(t);
        t = setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        if (t) {
          clearTimeout(t);
        }
        t = setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        function onScroll() {
          if (this.timer) clearTimeout(this.timer);
          this.timer = setTimeout(update, 16);
        }
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    // Reported once, on the assignment.
    {
      code: `
        clearTimeout(t);
        clearTimeout(t);
        t = setTimeout(f, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    // Inside a call argument.
    {
      code: `
        input.addEventListener('input', () => {
          clearTimeout(timer);
          timer = setTimeout(search, 300);
        });
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        function onInput() {
          clearTimeout(a);
          a = setTimeout(search, 300);
        }
        function onResize() {
          clearTimeout(b);
          b = setTimeout(layout, 50);
        }
      `,
      errors: [
        { messageId: 'preferDebounce' },
        { messageId: 'preferDebounce' },
      ],
    },
    // TypeScript.
    {
      code: `
        let timer: ReturnType<typeof setTimeout> | undefined;
        function onInput(query: string): void {
          clearTimeout(timer);
          timer = setTimeout(() => search(query), 300);
        }
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        class Search {
          private timer?: number;
          onInput(query: string): void {
            if (this.timer) window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => this.search(query), 300);
          }
          search(query: string): void {}
        }
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
  ],
});
