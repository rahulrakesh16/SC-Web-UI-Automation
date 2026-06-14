import { type Page } from '@playwright/test';
import { CalculatorPage } from '@pages/calculator-page';

export class PageManager {
  private readonly _page: Page;
  private _calculatorPage?: CalculatorPage;

  constructor(page: Page) {
    this._page = page;
  }

  get page(): Page {
    return this._page;
  }

  onCalculatorPage(): CalculatorPage {
    this._calculatorPage ??= new CalculatorPage(this._page);
    return this._calculatorPage;
  }
}
