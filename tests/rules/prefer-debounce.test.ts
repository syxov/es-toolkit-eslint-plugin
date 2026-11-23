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
    // The callback only resets transient state: a restartable "Copied!" flag, not a debounce.
    `
      const copy = async () => {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          setIsCopied(false);
        }, 1200);
      };
    `,
    `
      clearTimeout(highlightTimeout.current);
      rootElement.style.outline = '2px solid red';
      highlightTimeout.current = setTimeout(() => {
        rootElement.style.outline = '';
      }, 1000);
    `,
    `
      if (copiedTimeout !== undefined) clearTimeout(copiedTimeout);
      copiedTimeout = setTimeout(() => {
        delete trigger.dataset.copied;
      }, 2000);
    `,
    `
      clearTimeout(startedOutsideTimeoutRef.current!);
      startedOutsideTimeoutRef.current = setTimeout(() => {
        startedOutsideRef.current = false;
        startedOutsideTimeoutRef.current = null;
      }, 100);
    `,
    `
      clearTimeout(timer);
      timer = setTimeout(() => setChangingCollapse(false), 250);
    `,
    // A Node timer that is unref'd: the timer inside \`debounce\` cannot be.
    `
      class Project {
        private warmupTimer?: NodeJS.Timeout;
        schedule(): void {
          if (this.warmupTimer) clearTimeout(this.warmupTimer);
          this.warmupTimer = setTimeout(() => this.warmup(), 100);
          this.warmupTimer?.unref?.();
        }
        warmup(): void {}
      }
    `,
    `
      clearTimeout(t);
      t = setTimeout(flush, 100);
      t.unref();
    `,
    // One timer per key: a single \`debounce\` cannot replace it.
    `
      clearTimeout(this._timeouts[storageKey]);
      this._timeouts[storageKey] = setTimeout(this._flush.bind(this), 100);
    `,
  ],
  invalid: [
    {
      // The callback does more than reset state to fixed values.
      code: `
        clearTimeout(filterTimeout.current);
        filterTimeout.current = setTimeout(() => {
          setIsApplying(false);
          applyValue({ ...item, value: [lowerBound, upperBound] });
        }, 300);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        clearTimeout(removeTimeout);
        removeTimeout = setTimeout(() => removeHighlight(id), 3500);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      code: `
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.debounceTimer = undefined;
          void this.scan();
        }, delayMs);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      // A different handle is unref'd.
      code: `
        clearTimeout(t);
        t = setTimeout(flush, 100);
        other.unref();
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
    {
      // A literal key names one fixed timer.
      code: `
        clearTimeout(timers['save']);
        timers['save'] = setTimeout(save, 100);
      `,
      errors: [{ messageId: 'preferDebounce' }],
    },
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
