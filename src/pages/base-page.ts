import { type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  readonly display: Locator;

  protected constructor(page: Page, display: Locator) {
    this.page = page;
    this.display = display;
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
    await this.display.waitFor({ state: 'visible' });
  }

  async getDisplayValue(): Promise<string> {
    return this.display.inputValue();
  }
}
