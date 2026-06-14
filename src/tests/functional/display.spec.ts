import { expect, test } from '@config/global-test-options';
import { DISPLAY } from '@utils/constants';

test.describe('Display Behaviour', () => {
  test.beforeEach(async ({ pageManager }) => {
    await pageManager.onCalculatorPage().clear();
  });

  test(
    'TC-DISP-001: The calculator display should show nothing when the page first loads',
    { tag: ['@smoke', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Assert display is empty after navigation', async () => {
        const value = await calc.getDisplayValue();
        await expect(calc.display).toDisplayResult(DISPLAY.EMPTY);
        expect(value).toBe(DISPLAY.EMPTY);
      });
    },
  );

  test(
    'TC-DISP-002: Pressing the Clear button after entering numbers should completely reset the display to empty',
    { tag: ['@smoke', '@regression', '@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter a value', async () => {
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
      });

      await test.step('Clear and assert display is empty', async () => {
        await calc.clear();
        await expect(calc.display).toDisplayResult(DISPLAY.EMPTY);
      });
    },
  );

  test(
    'TC-DISP-003: The display should update in real time showing each digit and operator as the user presses buttons',
    { tag: ['@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Press 1 and assert display shows "1"', async () => {
        await calc.buttons.button1.click();
        await expect(calc.display).toDisplayResult('1');
      });

      await test.step('Press + and assert display shows "1+"', async () => {
        await calc.buttons.buttonPlus.click();
        await expect(calc.display).toDisplayResult('1+');
      });

      await test.step('Press 2 and assert display shows "1+2"', async () => {
        await calc.buttons.button2.click();
        await expect(calc.display).toDisplayResult('1+2');
      });
    },
  );

  test(
    'TC-DISP-004: Evaluating an incomplete expression with a trailing operator (1+) should show an Error on the display',
    { tag: ['@P1'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter 1+ (trailing operator) and evaluate', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonPlus.click();
        const result = await calc.calculate();
        await expect(calc.display).toDisplayResult(DISPLAY.ERROR);
        expect(result).toBe(DISPLAY.ERROR);
      });
    },
  );

  test(
    'TC-DISP-005: Pressing Clear multiple times in a row should keep the display consistently empty each time',
    { tag: ['@P3'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter digits then press Clear three times', async () => {
        await calc.buttons.button9.click();
        await calc.buttons.button8.click();
        await calc.clear();
        await calc.clear();
        await calc.clear();
        await expect(calc.display).toDisplayResult(DISPLAY.EMPTY);
      });
    },
  );

  test(
    'TC-DISP-006: Entering a number followed by the decimal button should show the trailing dot on the display as "1."',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Press 1 then the decimal button', async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonDot.click();
        await expect(calc.display).toDisplayResult('1.');
      });
    },
  );

  test(
    'TC-DISP-007: Opening and closing parentheses around a digit should appear correctly in the display as "(5)"',
    { tag: ['@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Press open paren, digit 5, then close paren', async () => {
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button5.click();
        await calc.buttons.buttonCloseParen.click();
        await expect(calc.display).toDisplayResult('(5)');
      });
    },
  );

  test(
    'TC-DISP-008: The display field should be read-only so users cannot type directly into it using the keyboard',
    { tag: ['@smoke', '@P2'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Assert display has the disabled attribute preventing keyboard input', async () => {
        await expect(calc.display).toBeDisabled();
      });
    },
  );
});
