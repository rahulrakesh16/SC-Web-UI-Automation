import { expect, test } from '@config/global-test-options';
import { DISPLAY } from '@utils/constants';

test.describe('Boundary and Edge Case Tests', () => {
  test.beforeEach(async ({ pageManager }) => {
    await pageManager.onCalculatorPage().clear();
  });

  test(
    'TC-BOUND-001 (EP-Valid): Entering a single digit should evaluate to that same digit when the equals button is pressed',
    { tag: ['@smoke', '@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter single digit 5 and evaluate', async () => {
        await calc.buttons.button5.click();
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('5');
        expect(result).toBe('5');
      });
    },
  );

  test(
    'TC-BOUND-002 (EP-Invalid): Pressing a scientific function button on an empty display should show Error instead of crashing',
    { tag: ['@smoke', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Click cos on an empty display', async () => {
        await calc.buttons.buttonCos.click();
        await expect(calc.display).toDisplayResult(DISPLAY.ERROR);
      });
    },
  );

  test(
    'TC-BOUND-003 (EP-Invalid): Entering only an operator without any numbers and pressing equals should produce NaN',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter only + operator and evaluate — parser returns NaN for non-numeric token', async () => {
        await calc.buttons.buttonPlus.click();
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('NaN');
        expect(result).toBe('NaN');
      });
    },
  );

  test(
    'TC-BOUND-004 (BVA): Entering the minimum boundary value of zero and evaluating should display zero',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0 and evaluate', async () => {
        await calc.buttons.button0.click();
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('0');
        expect(result).toBe('0');
      });
    },
  );

  test(
    'TC-BOUND-005 (BVA): Entering the value just above zero (1) and evaluating should display 1',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1 and evaluate', async () => {
        await calc.buttons.button1.click();
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('1');
        expect(result).toBe('1');
      });
    },
  );

  test(
    'TC-BOUND-006 (BVA): Entering a very large nine-digit number (999999999) should be handled without overflow or truncation',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 999999999 and evaluate', async () => {
        for (let i = 0; i < 9; i++) {
          await calc.buttons.button9.click();
        }
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('999999999');
        expect(result).toBe('999999999');
      });
    },
  );

  test(
    'TC-BOUND-007 (BVA): Entering a very small decimal number (0.000001) should be displayed with full precision',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0.000001 digit by digit and evaluate', async () => {
        await calc.buttons.button0.click();
        await calc.buttons.buttonDot.click();
        for (let i = 0; i < 5; i++) {
          await calc.buttons.button0.click();
        }
        await calc.buttons.button1.click();
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult('0.000001');
        expect(result).toBe('0.000001');
      });
    },
  );

  test(
    'TC-BOUND-008 (DT): Entering 0 ÷ 5 should display Infinity because BUG-004 reverses the operands making it 5 ÷ 0',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0 ÷ 5 — reversed to 5/0 by BUG-004, yielding Infinity', async () => {
        await calc.buttons.button0.click();
        await calc.buttons.buttonDivide.click();
        await calc.buttons.button5.click();
        const result = await calc.calculate();
        await expect.soft(calc.display).toDisplayResult('Infinity');
        expect(result).toBe('Infinity');
      });
    },
  );

  test(
    'TC-BOUND-009 (DT): Entering 5 ÷ 0 should display Infinity but instead shows 0 because BUG-004 reverses operands making it 0 ÷ 5',
    { tag: ['@bug', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 5 ÷ 0 — reversed to 0/5 = 0 by BUG-004, swallowing the division-by-zero error', async () => {
        await calc.buttons.button5.click();
        await calc.buttons.buttonDivide.click();
        await calc.buttons.button0.click();
        const result = await calc.calculate();
        await expect.soft(calc.display).toDisplayResult('0');
        expect(result).toBe('0');
      });
    },
  );

  test(
    'TC-BOUND-010 (DT): Entering an expression with an unclosed parenthesis "(5+2" silently computes the result 7 instead of showing an Error — BUG-006',
    { tag: ['@bug', '@regression', '@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter (5+2 without closing paren and evaluate', async () => {
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        const result = await calc.calculate();
        await expect.soft(calc.display).toDisplayResult('7');
        expect(result).toBe('7');
      });
    },
  );

  test(
    'TC-BOUND-011 (EG): Typing a double decimal point in an entry (1..5) silently evaluates to "1" instead of showing NaN or Error — BUG-008',
    { tag: ['@bug', '@regression', '@P3'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1..5 and assert actual (buggy) result — correct assertion in TC-BUG-008', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.button5.click();
        const result = await calc.calculate();
        // Correct: double decimal is invalid → NaN or Error — see TC-BUG-008 regression test
        // Actual:  second decimal silently dropped; "1..5" parsed as "1", returns "1"
        expect(result, 'BUG-008: 1..5 silently evaluates to "1" not NaN/Error').toBe('1');
      });
    },
  );

  test(
    'TC-BOUND-012 (EG): Pressing the equals button multiple times in a row after a calculation should not corrupt the state or crash',
    { tag: ['@P3'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 5 + 2, evaluate, then press = three more times', async () => {
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        await calc.calculate();
        await calc.calculate();
        await calc.calculate();
        await calc.calculate();
        const final = await calc.getDisplayValue();
        expect(final).not.toBe('');
      });
    },
  );

  test(
    'TC-BOUND-013 (ST): After the display shows an Error, pressing Clear should allow the user to start a fresh valid expression',
    { tag: ['@smoke', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Trigger an error state by evaluating a trailing operator', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonPlus.click();
        const errorResult = await calc.calculate();
        expect(errorResult).toBe(DISPLAY.ERROR);
      });

      await test.step('Clear the error and enter a valid expression', async () => {
        await calc.clear();
        await calc.buttons.button4.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button4.click();
        const result = await calc.calculate();
        expect(result).toBe('8');
      });
    },
  );

  test(
    'TC-BOUND-014 (ST): A successfully calculated result should remain visible on the display until the user enters a new button press',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Compute 2 + 2 and verify the result persists on the display', async () => {
        await calc.buttons.button2.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        const result = await calc.calculate();
        expect(result).toBe('4');
        const persisted = await calc.getDisplayValue();
        expect(persisted).toBe('4');
      });
    },
  );

  test(
    'TC-BOUND-015 (BVA): Floating-point arithmetic (0.1 + 0.2) should produce a result very close to 0.3',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 0.1 + 0.2 and check result is approximately 0.3', async () => {
        await calc.buttons.button0.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.button1.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button0.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.button2.click();
        const result = await calc.calculate();
        const numeric = parseFloat(result);
        expect(Math.abs(numeric - 0.3)).toBeLessThan(1e-10);
      });
    },
  );
});
