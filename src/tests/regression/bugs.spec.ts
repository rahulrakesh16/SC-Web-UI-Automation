import { expect, test } from '@config/global-test-options';
import { DISPLAY, KNOWN_BUG_NOTES } from '@utils/constants';

/**
 * Regression suite for known defects.
 * Each test asserts CORRECT EXPECTED BEHAVIOUR.
 * All tests FAIL against the current implementation — this is intentional.
 * Fix the application to make them pass.
 *
 * See /reports/bugs/BUG-00X.md for full Jira-format defect reports.
 */
test.describe('Regression — Known Bugs', () => {
  test.beforeEach(async ({ pageManager }) => {
    await pageManager.onCalculatorPage().clear();
  });

  test(
    'TC-BUG-001: Clicking the minus button should append a subtraction sign to the display, not a division slash [FAILS — BUG-001 OPEN]',
    { tag: ['@regression', '@bug', '@P1', '@critical'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Defect: ${KNOWN_BUG_NOTES.BUG_001}`, async () => {
        await calc.buttons.buttonMinus.click();
        const value = await calc.getDisplayValue();

        // Correct: "−" button must append "-" (subtraction operator)
        // Actual:  appends "/" (division operator)
        expect(value, 'BUG-001: "−" button appends "/" instead of "-"').toBe('-');
      });
    },
  );

  test(
    'TC-BUG-002: Pressing the button labelled "3" should append the digit 3 to the display, not the digit 0 [FAILS — BUG-002 OPEN]',
    { tag: ['@regression', '@bug', '@P1', '@critical'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Defect: ${KNOWN_BUG_NOTES.BUG_002}`, async () => {
        await calc.buttons.button3.click();
        const value = await calc.getDisplayValue();

        // Correct: "3" button must append "3"
        // Actual:  appends "0"
        expect(value, 'BUG-002: "3" button appends "0" instead of "3"').toBe('3');
      });
    },
  );

  test(
    'TC-BUG-003: Calculating sin of zero should display 0, not 1 — the sin function returns a hardcoded value for all inputs [FAILS — BUG-003 OPEN]',
    { tag: ['@regression', '@bug', '@P1', '@high'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Defect: ${KNOWN_BUG_NOTES.BUG_003}`, async () => {
        const result = await calc.computeScientific('sin', 0);

        // Correct: sin(0) = 0
        // Actual:  always returns 1 (hardcoded XOR 434563^434562 = 1)
        expect(result, 'BUG-003: sin() always returns 1 due to hardcoded XOR value').toBe('0');
      });
    },
  );

  test(
    'TC-BUG-004: Dividing 6 by 2 should display 3, but the parser has the operands swapped and computes 2 ÷ 6 instead [FAILS — BUG-004 OPEN]',
    { tag: ['@regression', '@bug', '@P1', '@high'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Defect: ${KNOWN_BUG_NOTES.BUG_004}`, async () => {
        await calc.buttons.button6.click();
        await calc.buttons.buttonDivide.click();
        await calc.buttons.button2.click();
        const result = await calc.calculate();

        // Correct: 6 ÷ 2 = 3
        // Actual:  computes 2/6 ≈ 0.333... (operands swapped in recursive descent parser)
        expect(result, 'BUG-004: Division reversed — 6÷2 yields 0.333 instead of 3').toBe('3');
      });
    },
  );

  test(
    'TC-BUG-005: Pressing equals on an empty display should show Error or remain empty, not display the text "undefined" [FAILS — BUG-005 OPEN]',
    { tag: ['@regression', '@bug', '@P2', '@medium'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Evaluate an empty display and assert no "undefined" is shown', async () => {
        const result = await calc.calculate();

        // Correct: empty display = should show "Error" or remain empty
        // Actual:  shows "undefined" (JS evaluateExpression returns undefined for empty token array)
        const isAcceptable = result === '' || result === 'Error';
        expect(
          isAcceptable,
          `BUG-005: Evaluating empty display shows "${result}" not Error/empty`,
        ).toBe(true);
      });
    },
  );

  test(
    'TC-BUG-006: Evaluating an expression with an unclosed parenthesis like "(5+2" should show Error, not silently return the result 7 [FAILS — BUG-006 OPEN]',
    { tag: ['@regression', '@bug', '@P2', '@medium'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Enter (5+2 without a closing parenthesis and evaluate', async () => {
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button5.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button2.click();
        const result = await calc.calculate();

        // Correct: missing closing paren must return Error
        // Actual:  parser silently ignores missing ) and returns 7
        expect(result, 'BUG-006: Unbalanced paren silently computes 7 instead of Error').toBe(
          'Error',
        );
      });
    },
  );

  test(
    'TC-BUG-007: A parenthesised expression followed by multiplication like (2+4)×5 should equal 30, but the parser discards the multiplier and returns 6 [FAILS — BUG-007 OPEN]',
    { tag: ['@regression', '@bug', '@P1', '@critical'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Defect: ${KNOWN_BUG_NOTES.BUG_007}`, async () => {
        await calc.buttons.buttonOpenParen.click();
        await calc.buttons.button2.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button4.click();
        await calc.buttons.buttonCloseParen.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button5.click();
        const result = await calc.calculate();

        // Correct: (2+4)×5 = 6×5 = 30
        // Actual:  parser evaluates only the parenthesised group, discards trailing ×5 → returns 6
        expect(result, 'BUG-007: (2+4)×5 returns "6" instead of "30"').toBe('30');
      });
    },
  );

  test(
    'TC-BUG-008: Entering a double decimal point in a number like "1..5" should produce NaN or Error, not silently evaluate as "1" [FAILS — BUG-008 OPEN]',
    { tag: ['@regression', '@bug', '@P3', '@low'] },
    async ({ pageManager }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step(`Defect: ${KNOWN_BUG_NOTES.BUG_008}`, async () => {
        await calc.buttons.button1.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.buttonDot.click();
        await calc.buttons.button5.click();
        const result = await calc.calculate();

        // Correct: double decimal "1..5" is invalid syntax → NaN or Error
        // Actual:  second decimal silently dropped; expression parsed as "1", returns "1"
        const isAcceptable = result === 'NaN' || result === DISPLAY.ERROR;
        expect(isAcceptable, `BUG-008: "1..5" evaluates to "${result}" not NaN/Error`).toBe(true);
      });
    },
  );
});
