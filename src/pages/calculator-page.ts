import { type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base-page';
import { ButtonPanel } from '@object-repository/button-panel';
import { BASE_URL } from '@utils/constants';
import type { ScientificFn } from '@calc-types/calculator-types';

export class CalculatorPage extends BasePage {
  readonly buttons: ButtonPanel;

  constructor(page: Page) {
    const buttons = new ButtonPanel(page);
    super(page, buttons.display);
    this.buttons = buttons;
  }

  async navigate(): Promise<void> {
    await super.navigate(BASE_URL);
  }

  async clear(): Promise<void> {
    await this.buttons.buttonClear.click();
  }

  async calculate(): Promise<string> {
    await this.buttons.buttonEquals.click();
    return this.getDisplayValue();
  }

  async pressDigitSequence(chars: string): Promise<void> {
    for (const char of chars) {
      const btn = this.charToButton(char);
      await btn.click();
    }
  }

  async computeScientific(fn: ScientificFn, input: number): Promise<string> {
    await this.clear();
    await this.pressDigitSequence(String(input));
    const fnMap = new Map<ScientificFn, Locator>([
      ['sin', this.buttons.buttonSin],
      ['cos', this.buttons.buttonCos],
      ['tan', this.buttons.buttonTan],
      ['sqrt', this.buttons.buttonSqrt],
      ['log', this.buttons.buttonLog],
    ]);
    const btn = fnMap.get(fn);
    if (!btn) {
      throw new Error(`Unsupported scientific function: ${fn}`);
    }
    await btn.click();
    return this.getDisplayValue();
  }

  private charToButton(char: string): Locator {
    const charMap = new Map<string, Locator>([
      ['0', this.buttons.button0],
      ['1', this.buttons.button1],
      ['2', this.buttons.button2],
      ['4', this.buttons.button4],
      ['5', this.buttons.button5],
      ['6', this.buttons.button6],
      ['7', this.buttons.button7],
      ['8', this.buttons.button8],
      ['9', this.buttons.button9],
      ['+', this.buttons.buttonPlus],
      ['*', this.buttons.buttonMultiply],
      ['/', this.buttons.buttonDivide],
      ['.', this.buttons.buttonDot],
      ['(', this.buttons.buttonOpenParen],
      [')', this.buttons.buttonCloseParen],
    ]);
    const btn = charMap.get(char);
    if (!btn) {
      throw new Error(
        `Character '${char}' has no corresponding button. ` +
          `Digit '3' (BUG-002) and operator '-' (BUG-001) are not accessible.`,
      );
    }
    return btn;
  }
}
