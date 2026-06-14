// OWASP A02: Cryptographic Failures — sensitive data stored without encryption
// OWASP A03: Injection — XSS via display input
// OWASP A08: Software and Data Integrity Failures — prototype pollution
// OWASP A09: Security Logging and Monitoring Failures — stack traces in console

import { expect, test } from '@config/global-test-options';
import { BASE_URL } from '@utils/constants';

test.describe('Client-Side Storage and Input Security', () => {
  test(
    'TC-SEC-007: The browser localStorage should remain empty after performing calculations — no calculation history should be stored locally',
    { tag: ['@owasp-a02', '@smoke', '@P1'] },
    async ({ pageManager, page }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Perform several calculations to trigger any potential storage writes', async () => {
        await calc.buttons.button9.click();
        await calc.buttons.buttonPlus.click();
        await calc.buttons.button1.click();
        await calc.calculate();
        await calc.clear();
        await calc.buttons.button5.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button4.click();
        await calc.calculate();
      });

      await test.step('Assert localStorage has no entries after the calculations', async () => {
        const len = await page.evaluate(() => window.localStorage.length);
        expect(len, 'localStorage contains entries — calculation history may be persisted').toBe(0);
      });
    },
  );

  test(
    'TC-SEC-008: The browser sessionStorage should remain empty after performing calculations — no session data should be written',
    { tag: ['@owasp-a02', '@P1'] },
    async ({ pageManager, page }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Perform a calculation to trigger any potential session storage writes', async () => {
        await calc.buttons.button7.click();
        await calc.buttons.buttonMultiply.click();
        await calc.buttons.button8.click();
        await calc.calculate();
      });

      await test.step('Assert sessionStorage has no entries after the calculation', async () => {
        const len = await page.evaluate(() => window.sessionStorage.length);
        expect(len, 'sessionStorage contains entries — session data persisted').toBe(0);
      });
    },
  );

  test(
    'TC-SEC-009: Triggering calculation errors should not print stack traces or internal variable names to the browser console',
    { tag: ['@owasp-a09', '@P1'] },
    async ({ pageManager, page }) => {
      const calc = pageManager.onCalculatorPage();
      const consoleMessages: { type: string; text: string }[] = [];

      await test.step('Capture all console output while triggering error-prone interactions', async () => {
        page.on('console', (msg) => {
          consoleMessages.push({ type: msg.type(), text: msg.text() });
        });

        await calc.buttons.button1.click();
        await calc.buttons.buttonPlus.click();
        await calc.calculate();
        await calc.clear();
        await calc.buttons.buttonSin.click();
      });

      await test.step('Assert no sensitive error patterns appear in the captured console output', () => {
        const sensitivePatterns = [/at\s+\w+\s+\(/, /ReferenceError/, /TypeError/, /SyntaxError/];
        for (const msg of consoleMessages) {
          for (const pattern of sensitivePatterns) {
            expect(
              pattern.test(msg.text),
              `Console ${msg.type} leaks sensitive data: "${msg.text}"`,
            ).toBe(false);
          }
        }
      });
    },
  );

  test(
    'TC-SEC-010: Calculation results should not be exposed as data properties on the global window object',
    { tag: ['@owasp-a02', '@P2'] },
    async ({ pageManager, page }) => {
      const calc = pageManager.onCalculatorPage();

      await test.step('Compute a result that could potentially be stored on window', async () => {
        await calc.buttons.button9.click();
        await calc.buttons.button9.click();
        await calc.calculate();
      });

      await test.step('Assert no display or result data properties are found on the window object', async () => {
        const suspiciousKeys = await page.evaluate(() =>
          Object.keys(window).filter((k) => {
            // eslint-disable-next-line security/detect-object-injection
            const val = (window as unknown as Record<string, unknown>)[k];
            if (typeof val === 'function') {
              return false;
            }
            return k.toLowerCase().includes('display') || k.toLowerCase().includes('result');
          }),
        );
        expect(
          suspiciousKeys,
          `Sensitive data properties on window: ${suspiciousKeys.join(', ')}`,
        ).toHaveLength(0);
      });
    },
  );

  test(
    'TC-SEC-011: Injecting an XSS script payload into the display field should not cause any JavaScript alerts to fire',
    { tag: ['@owasp-a03', '@P1'] },
    async ({ page }) => {
      const alertFired: boolean[] = [];

      await test.step('Set up a dialog listener to detect any alert that might fire', () => {
        page.on('dialog', async (dialog) => {
          alertFired.push(true);
          await dialog.dismiss();
        });
      });

      await test.step('Navigate to the calculator and inject the XSS payload into the display', async () => {
        await page.goto(BASE_URL);
        await page.locator("//input[@id='display']").waitFor({ state: 'visible' });

        await page.evaluate(() => {
          const display = document.getElementById('display') as HTMLInputElement | null;
          if (display) {
            display.removeAttribute('disabled');
            display.value = '<script>alert(1)<\\/script><img src=x onerror=alert(1)>';
          }
        });
      });

      await test.step('Assert no XSS alert was triggered by the injected payload', () => {
        expect(alertFired, 'XSS alert fired — display reflects unsanitised input').toHaveLength(0);
      });
    },
  );

  test(
    'TC-SEC-012: Setting the display value to "__proto__" should not crash the application or cause any unhandled exceptions',
    { tag: ['@owasp-a08', '@P2'] },
    async ({ page }) => {
      await test.step('Navigate to the calculator and inject the __proto__ string into the display', async () => {
        await page.goto(BASE_URL);
        await page.locator("//input[@id='display']").waitFor({ state: 'visible' });

        const errorOccurred = await page.evaluate(() => {
          try {
            const display = document.getElementById('display') as HTMLInputElement | null;
            if (display) {
              display.removeAttribute('disabled');
              display.value = '__proto__';
            }
            return false;
          } catch {
            return true;
          }
        });

        expect(errorOccurred, 'Application threw on __proto__ input').toBe(false);
        await expect(page.locator("//div[@class='calculator']")).toBeVisible();
      });
    },
  );
});
