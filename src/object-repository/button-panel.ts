import { type Locator, type Page } from '@playwright/test';

const BTN = (text: string): string =>
  `//div[@class='buttons']//button[normalize-space()='${text}']`;

export class ButtonPanel {
  readonly display: Locator;
  readonly buttonClear: Locator;
  readonly buttonOpenParen: Locator;
  readonly buttonCloseParen: Locator;
  readonly buttonDivide: Locator;
  readonly button7: Locator;
  readonly button8: Locator;
  readonly button9: Locator;
  readonly buttonMultiply: Locator;
  readonly button4: Locator;
  readonly button5: Locator;
  readonly button6: Locator;
  readonly buttonMinus: Locator;
  readonly button1: Locator;
  readonly button2: Locator;
  readonly button3: Locator;
  readonly buttonPlus: Locator;
  readonly button0: Locator;
  readonly buttonDot: Locator;
  readonly buttonEquals: Locator;
  readonly buttonSin: Locator;
  readonly buttonCos: Locator;
  readonly buttonTan: Locator;
  readonly buttonSqrt: Locator;
  readonly buttonLog: Locator;

  constructor(page: Page) {
    this.display = page.locator("//input[@id='display']");
    this.buttonClear = page.locator(BTN('C'));
    this.buttonOpenParen = page.locator(BTN('('));
    this.buttonCloseParen = page.locator(BTN(')'));
    this.buttonDivide = page.locator(BTN('÷'));
    this.button7 = page.locator(BTN('7'));
    this.button8 = page.locator(BTN('8'));
    this.button9 = page.locator(BTN('9'));
    this.buttonMultiply = page.locator(BTN('×'));
    this.button4 = page.locator(BTN('4'));
    this.button5 = page.locator(BTN('5'));
    this.button6 = page.locator(BTN('6'));
    this.buttonMinus = page.locator(BTN('−'));
    this.button1 = page.locator(BTN('1'));
    this.button2 = page.locator(BTN('2'));
    this.button3 = page.locator(BTN('3'));
    this.buttonPlus = page.locator(BTN('+'));
    this.button0 = page.locator(BTN('0'));
    this.buttonDot = page.locator(BTN('.'));
    this.buttonEquals = page.locator(BTN('='));
    this.buttonSin = page.locator(BTN('sin'));
    this.buttonCos = page.locator(BTN('cos'));
    this.buttonTan = page.locator(BTN('tan'));
    this.buttonSqrt = page.locator(BTN('√'));
    this.buttonLog = page.locator(BTN('log'));
  }
}
