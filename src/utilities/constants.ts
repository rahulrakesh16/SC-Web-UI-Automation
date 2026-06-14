export const BASE_URL = 'https://rbihubcodechallenge.github.io/calculator/index.html';

export const DISPLAY = {
  ERROR: 'Error',
  EMPTY: '',
} as const;

export const EXPECTED_RESULTS = {
  SQRT_4: '2',
  SQRT_9: '3',
  SQRT_0: '0',
  SQRT_2: String(Math.sqrt(2)),
  COS_0: '1',
  TAN_0: '0',
  LOG_100: '2',
  LOG_1: '0',
  SIN_0_ACTUAL: '1',
} as const;

export const KNOWN_BUG_NOTES = {
  BUG_001: 'BUG-001: "−" button appends "/" (division) not "-" (subtraction)',
  BUG_002: 'BUG-002: "3" button appends "0" not "3"',
  BUG_003: 'BUG-003: sin() always returns 1 regardless of input',
  BUG_004: 'BUG-004: Division operands reversed — a÷b computes b/a',
  BUG_007: 'BUG-007: Parser drops trailing ×factor after closing paren — (a+b)×c returns (a+b)',
  BUG_008: 'BUG-008: Double decimal "1..5" silently evaluates to "1" instead of NaN/Error',
} as const;
