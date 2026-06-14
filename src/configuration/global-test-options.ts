import { test as base, expect as baseExpect, type Locator } from '@playwright/test';
import { PageManager } from '@object-repository/page-manager';

type TestFixtures = {
  pageManager: PageManager;
};

declare module '@playwright/test' {
  interface Matchers<R> {
    toDisplayResult(expected: string): Promise<R>;
  }
}

export const expect = baseExpect.extend({
  async toDisplayResult(locator: Locator, expected: string) {
    const value = await locator.inputValue();
    const pass = value === expected;
    return {
      pass,
      name: 'toDisplayResult',
      message: (): string =>
        pass
          ? `Expected display not to show '${expected}'`
          : `Expected display to show '${expected}', but got '${value}'`,
    };
  },
});

export const test = base.extend<TestFixtures>({
  pageManager: async ({ page }, use, testInfo) => {
    const manager = new PageManager(page);
    await manager.onCalculatorPage().navigate();

    await use(manager);

    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('failure-screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
      const domSnapshot = await page.content();
      await testInfo.attach('failure-dom-snapshot', {
        body: domSnapshot,
        contentType: 'text/html',
      });
    }
  },
});
