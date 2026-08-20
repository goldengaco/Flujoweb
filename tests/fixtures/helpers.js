/**
 * Test Fixtures & Assertion Helpers
 */

const assert = require('assert');

class TestContext {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failed = 0;
    this.failures = [];
    this.startTime = Date.now();
  }

  async test(description, fn) {
    const start = Date.now();
    try {
      await fn();
      this.passed++;
      const duration = Date.now() - start;
      console.log(`  \x1b[32m✔\x1b[0m ${description} \x1b[90m(${duration}ms)\x1b[0m`);
    } catch (err) {
      this.failed++;
      const duration = Date.now() - start;
      console.error(`  \x1b[31m✖\x1b[0m ${description} \x1b[90m(${duration}ms)\x1b[0m`);
      console.error(`    \x1b[31mError: ${err.message}\x1b[0m`);
      if (err.stack) {
        console.error(`    \x1b[90m${err.stack.split('\n').slice(1, 4).join('\n    ')}\x1b[0m`);
      }
      this.failures.push({ description, error: err.message, stack: err.stack });
    }
  }

  summary() {
    const total = this.passed + this.failed;
    const duration = Date.now() - this.startTime;
    return {
      name: this.name,
      total,
      passed: this.passed,
      failed: this.failed,
      duration,
      failures: this.failures
    };
  }
}

const Helpers = {
  assertTrue(condition, msg = 'Expected true') {
    if (!condition) throw new Error(msg);
  },

  assertFalse(condition, msg = 'Expected false') {
    if (condition) throw new Error(msg);
  },

  assertEqual(actual, expected, msg = '') {
    if (actual !== expected) {
      throw new Error(`${msg} - Expected [${expected}] but got [${actual}]`);
    }
  },

  assertIncludes(actual, expectedSubstring, msg = '') {
    if (typeof actual !== 'string' || !actual.includes(expectedSubstring)) {
      throw new Error(`${msg} - Expected "${actual}" to include "${expectedSubstring}"`);
    }
  },

  assertGreaterThan(actual, threshold, msg = '') {
    if (Number(actual) <= Number(threshold)) {
      throw new Error(`${msg} - Expected ${actual} > ${threshold}`);
    }
  },

  assertBetween(actual, min, max, msg = '') {
    const n = Number(actual);
    if (n < min || n > max) {
      throw new Error(`${msg} - Expected ${n} to be between ${min} and ${max}`);
    }
  },

  async assertNoConsoleErrors(browser, context = '') {
    const errors = browser.getConsoleErrors();
    // Filter out potential non-critical favicon 404s if any
    const realErrors = errors.filter(e => !e.text.includes('favicon.ico'));
    if (realErrors.length > 0) {
      const msgs = realErrors.map(e => e.text).join(' | ');
      throw new Error(`Console errors detected in ${context}: ${msgs}`);
    }
  },

  async assertElementVisible(browser, selector, msg = '') {
    const isVis = await browser.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && (el.offsetWidth > 0 || el.offsetHeight > 0);
    }, selector);
    if (!isVis) {
      throw new Error(`Element ${selector} is not visible. ${msg}`);
    }
  },

  async assertEmojiPresent(browser, selector, expectedEmoji, msg = '') {
    const text = await browser.getText(selector);
    if (!text || !text.includes(expectedEmoji)) {
      throw new Error(`Expected emoji "${expectedEmoji}" at ${selector} but found "${text}". ${msg}`);
    }
  },

  async assertNoHorizontalOverflow(browser, context = '') {
    const overflow = await browser.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = Math.max(doc.clientWidth, body.clientWidth);
      return {
        scrollWidth,
        clientWidth,
        hasOverflow: scrollWidth > clientWidth + 2 // allow 2px margin
      };
    });

    if (overflow.hasOverflow) {
      throw new Error(`Horizontal overflow detected in ${context}: scrollWidth (${overflow.scrollWidth}px) > clientWidth (${overflow.clientWidth}px)`);
    }
  }
};

module.exports = {
  TestContext,
  Helpers
};
