import { expect, test } from '@config/global-test-options';
import { KNOWN_BUG_NOTES } from '@utils/constants';

test.describe('Arithmetic Operations', () => {
  test.beforeEach(async ({ pageManager }) => {
    await pageManager.onCalculatorPage().clear();
  });

  test(
    'TC-ARITH-001: Adding two positive integers (7 + 8) should display the correct sum of 15',
    { tag: ['@smoke', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 7 + 8', async () => {
        await calc.buttons.button7.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button8.click();
      });

      await test.step('Assert result is 15', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('15');
        expect(result).toBe('15');
      });
    },
  );

  test(
    'TC-ARITH-002: Adding zero to zero should display zero',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0 + 0', async () => {
        await calc.buttons.button0.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button0.click();
      });

      await test.step('Assert result is 0', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('0');
        expect(result).toBe('0');
      });
    },
  );

  test(
    'TC-ARITH-003: Adding two decimal numbers (1.5 + 2.5) should display the exact sum of 4',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1.5 + 2.5', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.button5.click();
      });

      await test.step('Assert result is 4', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('4');
        expect(result).toBe('4');
      });
    },
  );

  test(
    'TC-ARITH-004: Adding a large number near 1000 (999 + 1) should correctly cross the boundary and display 1000',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 999 + 1', async () => {
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button1.click();
      });

      await test.step('Assert result is 1000', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('1000');
        expect(result).toBe('1000');
      });
    },
  );

  test(
    'TC-ARITH-005: Multiplying two positive integers (4 × 5) should display the correct product of 20',
    { tag: ['@smoke', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 4 × 5', async () => {
        await calc.buttons.button4.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button5.click();
      });

      await test.step('Assert result is 20', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('20');
        expect(result).toBe('20');
      });
    },
  );

  test(
    'TC-ARITH-006: Multiplying any number by zero (7 × 0) should always produce zero',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 7 × 0', async () => {
        await calc.buttons.button7.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button0.click();
      });

      await test.step('Assert result is 0', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('0');
        expect(result).toBe('0');
      });
    },
  );

  test(
    'TC-ARITH-007: Chaining three additions (1 + 2 + 4) should give the correct cumulative total of 7',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1 + 2 + 4', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button4.click();
      });

      await test.step('Assert result is 7', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('7');
        expect(result).toBe('7');
      });
    },
  );

  test(
    'TC-ARITH-008: Multiplication should take precedence over addition — entering 2 + 4 × 5 should display 22 not 30',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 2 + 4 × 5', async () => {
        await calc.buttons.button2.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button4.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button5.click();
      });

      await test.step('Assert × is evaluated before + giving 22', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('22');
        expect(result).toBe('22');
      });
    },
  );

  test(
    'TC-ARITH-009: Parentheses followed by multiplication returns only the grouped result — (2+4)×5 shows 6 instead of 30 due to BUG-007',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Enter (2+4)×5 — note: ${KNOWN_BUG_NOTES.BUG_007}`, async () => {
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button2.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button4.click();
        await calc.buttons.buttonCloseParen.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button5.click();
      });

      await test.step('Assert actual (buggy) result — correct value (30) is in TC-BUG-007', async () => {
        const result = await calc.calculate();
        // Correct: (2+4)×5 = 30 — see TC-BUG-007 regression test
        // Actual:  parser discards ×5 after ), returns only the grouped result 6
        expect(result, 'BUG-007: (2+4)×5 returns 6 not 30').toBe('6');
      });
    },
  );

  test(
    'TC-ARITH-010: Two parenthesised groups multiplied together only evaluates the first group — (1+2)×(4+5) shows 3 instead of 27 due to BUG-007',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Enter (1+2)×(4+5) — note: ${KNOWN_BUG_NOTES.BUG_007}`, async () => {
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button1.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        await calc.buttons.buttonCloseParen.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button4.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button5.click();
        await calc.buttons.buttonCloseParen.click();
      });

      await test.step('Assert actual (buggy) result — correct value (27) is in TC-BUG-007', async () => {
        const result = await calc.calculate();
        // Correct: (1+2)×(4+5) = 27 — see TC-BUG-007 regression test
        // Actual:  parser evaluates only the first group, returns 3
        expect(result, 'BUG-007: (1+2)×(4+5) returns 3 not 27').toBe('3');
      });
    },
  );

  test(
    'TC-ARITH-011: Division operands are swapped in the parser — entering 8 ÷ 4 computes 4 ÷ 8 and displays 0.5 instead of 2 due to BUG-004',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Entering 8 ÷ 4 — note: ${KNOWN_BUG_NOTES.BUG_004}`, async () => {
        await calc.buttons.button8.click();
        await calc.buttons.buttonDivide.click();
        await calc.buttons.button4.click();
      });

      await test.step('Assert actual (buggy) result is 0.5 not 2', async () => {
        const result = await calc.calculate();
        await expect.soft(calc.display).toDisplayResult('0.5');
        expect(result).toBe('0.5');
      });
    },
  );

  test(
    'TC-ARITH-012: The minus button is visually labelled "−" but incorrectly appends a division slash "/" to the display — BUG-001',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Note: ${KNOWN_BUG_NOTES.BUG_001}`, async () => {
        await calc.buttons.buttonMinus.click();
        const value = await calc.getDisplayValue();
        await expect.soft(calc.display).toDisplayResult('/');
        expect(value).toBe('/');
      });
    },
  );

  test(
    'TC-ARITH-013: The digit button labelled "3" incorrectly appends "0" to the display instead of "3" — BUG-002',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Note: ${KNOWN_BUG_NOTES.BUG_002}`, async () => {
        await calc.buttons.button3.click();
        const value = await calc.getDisplayValue();
        await expect.soft(calc.display).toDisplayResult('0');
        expect(value).toBe('0');
      });
    },
  );

  test(
    'TC-ARITH-014: Chaining the same addition three times (5 + 5 + 5) should accumulate to a total of 15',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 5 + 5 + 5', async () => {
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button5.click();
      });

      await test.step('Assert result is 15', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('15');
        expect(result).toBe('15');
      });
    },
  );

  test(
    'TC-ARITH-015: Multiplying large numbers (999 × 999) should display the correct product of 998001',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 999 × 999', async () => {
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
      });

      await test.step('Assert result is 998001', async () => {
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('998001');
        expect(result).toBe('998001');
      });
    },
  );
});
