import { test, expect } from '@config/global-test-options';
import { DISPLAY, EXPECTED_RESULTS, KNOWN_BUG_NOTES } from '@utils/constants';

test.describe('Scientific Functions', () => {
  test.beforeEach(async ({ pageManager }) => {
    await pageManager.onCalculatorPage().clear();
  });

  test(
    'TC-SCI-001: Square root of a perfect square (√4) should display the exact integer result of 2',
    { tag: ['@smoke', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 4 and click √', async () => {
        const result = await calc.computeScientific('sqrt', 4);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.SQRT_4);
        expect(result).toBe(EXPECTED_RESULTS.SQRT_4);
      });
    },
  );

  test(
    'TC-SCI-002: Square root of another perfect square (√9) should display the exact integer result of 3',
    { tag: ['@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 9 and click √', async () => {
        const result = await calc.computeScientific('sqrt', 9);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.SQRT_9);
        expect(result).toBe(EXPECTED_RESULTS.SQRT_9);
      });
    },
  );

  test(
    'TC-SCI-003: Square root of zero should display zero',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0 and click √', async () => {
        const result = await calc.computeScientific('sqrt', 0);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.SQRT_0);
        expect(result).toBe(EXPECTED_RESULTS.SQRT_0);
      });
    },
  );

  test(
    'TC-SCI-004: Square root of a non-perfect square (√2) should display the full irrational result',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 2 and click √', async () => {
        const result = await calc.computeScientific('sqrt', 2);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.SQRT_2);
        expect(result).toBe(EXPECTED_RESULTS.SQRT_2);
      });
    },
  );

  test(
    'TC-SCI-005: Cosine of zero should display exactly 1 (cos 0° = 1)',
    { tag: ['@smoke', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0 and click cos', async () => {
        const result = await calc.computeScientific('cos', 0);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.COS_0);
        expect(result).toBe(EXPECTED_RESULTS.COS_0);
      });
    },
  );

  test(
    'TC-SCI-006: Tangent of zero should display exactly 0 (tan 0° = 0)',
    { tag: ['@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0 and click tan', async () => {
        const result = await calc.computeScientific('tan', 0);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.TAN_0);
        expect(result).toBe(EXPECTED_RESULTS.TAN_0);
      });
    },
  );

  test(
    'TC-SCI-007: Log base 10 of 100 should display 2 because 10² = 100',
    { tag: ['@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 100 via buttons 1-0-0 and click log', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.button0.click();
        await calc.buttons.button0.click();
        await calc.buttons.buttonLog.click();
        const result = await calc.getDisplayValue();
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.LOG_100);
        expect(result).toBe(EXPECTED_RESULTS.LOG_100);
      });
    },
  );

  test(
    'TC-SCI-008: Log base 10 of 1 should display 0 because 10⁰ = 1',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1 and click log', async () => {
        const result = await calc.computeScientific('log', 1);
        await expect(calc.display).toDisplayResult(EXPECTED_RESULTS.LOG_1);
        expect(result).toBe(EXPECTED_RESULTS.LOG_1);
      });
    },
  );

  test(
    'TC-SCI-009: The sin function always returns 1 regardless of the input value due to a hardcoded result — BUG-003',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Note: ${KNOWN_BUG_NOTES.BUG_003}`, async () => {
        const result = await calc.computeScientific('sin', 0);
        await expect.soft(calc.display).toDisplayResult(EXPECTED_RESULTS.SIN_0_ACTUAL);
        expect(result).toBe(EXPECTED_RESULTS.SIN_0_ACTUAL);
      });
    },
  );

  test(
    'TC-SCI-010: Entering sin(90) confirms the bug — sin returns 1 instead of the mathematically correct value near 0.893 — BUG-003',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Note: ${KNOWN_BUG_NOTES.BUG_003}`, async () => {
        await calc.buttons.button9.click();
        await calc.buttons.button0.click();
        await calc.buttons.buttonSin.click();
        const result = await calc.getDisplayValue();
        await expect.soft(calc.display).toDisplayResult(EXPECTED_RESULTS.SIN_0_ACTUAL);
        expect(result).toBe(EXPECTED_RESULTS.SIN_0_ACTUAL);
      });
    },
  );

  test(
    'TC-SCI-011: Applying a scientific function to an empty display should show an Error message',
    { tag: ['@smoke', '@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Clear display and click sin', async () => {
        await calc.buttons.buttonSin.click();
        const result = await calc.getDisplayValue();
        await expect(calc.display).toDisplayResult(DISPLAY.ERROR);
        expect(result).toBe(DISPLAY.ERROR);
      });
    },
  );

  test(
    'TC-SCI-012: Applying cosine to a very large number (1000) should return a valid numeric result without crashing',
    { tag: ['@P3'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1000 and click cos', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.button0.click();
        await calc.buttons.button0.click();
        await calc.buttons.button0.click();
        await calc.buttons.buttonCos.click();
        const result = await calc.getDisplayValue();
        expect(isNaN(parseFloat(result))).toBe(false);
      });
    },
  );

  test(
    'TC-SCI-013: Tangent of 90 degrees is mathematically undefined — the calculator should display Infinity or a very large number, not crash',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 90 and click tan', async () => {
        await calc.buttons.button9.click();
        await calc.buttons.button0.click();
        await calc.buttons.buttonTan.click();
        const result = await calc.getDisplayValue();

        // tan(90°) in JavaScript is Number.POSITIVE_INFINITY or an extremely large value
        // depending on floating-point precision — it must not throw or display NaN
        const isLargeOrInfinite =
          result === 'Infinity' || result === '-Infinity' || Math.abs(parseFloat(result)) > 1e10;
        expect(
          isLargeOrInfinite,
          `tan(90°) should be Infinity or a very large number, got "${result}"`,
        ).toBe(true);
      });
    },
  );
});
