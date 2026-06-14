# SC-Web-UI-Automation

Production-grade Playwright + TypeScript automation framework for the [Scientific Calculator](https://rbihubcodechallenge.github.io/calculator/index.html).

[![Playwright Tests](https://github.com/rakeshsm/SC-Web-UI-Automation/actions/workflows/ci.yml/badge.svg)](https://github.com/rakeshsm/SC-Web-UI-Automation/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.52-green)](https://playwright.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-purple)](https://eslint.org/)

---

## Tech Stack

| Tool                                                 | Version | Purpose                            |
| ---------------------------------------------------- | ------- | ---------------------------------- |
| [Playwright](https://playwright.dev/)                | ^1.52.0 | Browser automation + test runner   |
| [TypeScript](https://www.typescriptlang.org/)        | ^5.8.3  | Strict type safety                 |
| [ESLint](https://eslint.org/)                        | ^9.27.0 | Static analysis (flat config v9)   |
| [Prettier](https://prettier.io/)                     | ^3.5.3  | Code formatting                    |
| [Husky](https://typicode.github.io/husky/)           | ^9.1.7  | Git hooks                          |
| [lint-staged](https://github.com/okonet/lint-staged) | ^16.1.0 | Pre-commit linting                 |
| [commitlint](https://commitlint.js.org/)             | ^19.8.1 | Conventional commit enforcement    |
| [ls-lint](https://ls-lint.org/)                      | ^2.3.1  | File naming convention enforcement |

---

## Project Structure

```
SC-Web-UI-Automation/
├── src/
│   ├── pages/
│   │   ├── base-page.ts              # Abstract page: navigate(), getDisplayValue()
│   │   └── calculator-page.ts        # POM + Facade (pressDigitSequence, computeScientific)
│   ├── object-repository/
│   │   ├── button-panel.ts           # All button locators (XPath with normalize-space())
│   │   └── page-manager.ts           # Lazy-init singleton PageManager
│   ├── configuration/
│   │   └── global-test-options.ts    # Extended test fixture + custom matcher
│   ├── utilities/
│   │   └── constants.ts              # BASE_URL, DISPLAY, EXPECTED_RESULTS, KNOWN_BUG_NOTES
│   ├── types/
│   │   └── calculator-types.ts       # ScientificFn union type
│   └── tests/
│       ├── functional/
│       │   ├── arithmetic.spec.ts    # 16 arithmetic tests (TC-ARITH-001–016)
│       │   ├── scientific.spec.ts    # 13 scientific function tests (TC-SCI-001–013)
│       │   └── display.spec.ts       # 8 display state tests (TC-DISP-001–008)
│       ├── boundary/
│       │   └── boundary.spec.ts      # 15 edge-case tests (TC-BOUND-001–015)
│       ├── security/
│       │   ├── headers.spec.ts       # 6 OWASP A05 tests (CSP, SRI, X-Frame-Options)
│       │   └── storage.spec.ts       # 6 OWASP A02/A03/A08/A09 tests
│       └── regression/
│           └── bugs.spec.ts          # 8 regression tests — all FAIL on current impl
├── reports/
│   └── bugs/
│       ├── BUG-001.md                # Minus button appends division slash
│       ├── BUG-002.md                # "3" button appends zero
│       ├── BUG-003.md                # sin() always returns 1
│       ├── BUG-004.md                # Division operands reversed
│       ├── BUG-005.md                # Empty display evaluates to "undefined"
│       ├── BUG-006.md                # Unbalanced parentheses silently compute
│       ├── BUG-007.md                # Parentheses + trailing multiplication discards multiplier
│       ├── BUG-008.md                # Double decimal silently accepted
│       └── screenshots/              # PNG evidence captured by Playwright MCP
├── results/
│   └── junit.xml                     # JUnit XML output (CI/CD integration)
├── .github/workflows/ci.yml          # GitHub Actions (quality-check + 3-browser matrix)
├── Jenkinsfile                        # Jenkins declarative pipeline (parallel 3-browser)
├── Dockerfile                         # Node 20 image with pre-installed Playwright browsers
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── .commitlintrc.cjs
├── .lintstagedrc.cjs
├── .ls-lint.yml
└── package.json
```

---

## Getting Started

```bash
# Prerequisites: Node.js >= 20, npm >= 10
npm install
npx playwright install --with-deps
```

### Run Tests

```bash
# All tests (headless, all configured browsers)
npm test

# Headed mode (visible browser)
npm run test:headed

# Playwright UI mode (interactive test explorer)
npm run test:ui

# By suite
npm run test:functional
npm run test:boundary
npm run test:security
npm run test:regression

# By tag
npm run test:smoke                        # @smoke tag (fast sanity check)
npx playwright test --grep @smoke
npx playwright test --grep @regression
npx playwright test --grep @bug

# CI mode (list + html reporters)
npm run test:ci
```

### Quality Gates

```bash
# TypeScript — zero errors required
npm run ts:check

# ESLint v9 flat config — zero violations
npm run lint

# ESLint with auto-fix
npm run lint:fix

# Prettier — check for drift
npm run format:check

# Prettier — apply formatting
npm run format

# ls-lint — enforce kebab-case file naming
npm run ls-lint

# All gates in one command
npm run quality:check
```

---

## Architecture

### Page Object Model + Facade

```
PageManager (lazy-init singleton per test)
    └── CalculatorPage (extends BasePage, composes ButtonPanel)
            ├── navigate()                ← goto BASE_URL, wait for display visible
            ├── clear()                   ← click C button
            ├── calculate()               ← click = button, return display value
            ├── pressDigitSequence(str)   ← iterate chars → click mapped buttons
            ├── computeScientific(fn, n)  ← clear → pressDigitSequence → fn button
            └── ButtonPanel               ← XPath locators, one per UI button
```

`charToButton()` intentionally omits `'3'` (BUG-002) and `'-'` (BUG-001) — attempting to press either throws `Error` with the bug ID embedded, making test failures self-documenting.

### Custom Test Fixture

`src/configuration/global-test-options.ts` extends Playwright's base `test` with:

- **`pageManager` fixture** — navigates to `BASE_URL`, waits for display visibility, yields a ready `PageManager`
- **`toDisplayResult` custom matcher** — reads `inputValue()` from the display `<input>` locator and asserts equality
- **Failure hooks** — on any unexpected status: auto-attaches full-page screenshot + raw DOM snapshot as test report artifacts

### Locator Strategy

All locators use **XPath with `normalize-space()`** to match button text exactly:

```typescript
//div[@class='buttons']//button[normalize-space()='sin']
//input[@id='display']
```

Resilient to whitespace-only changes; stable against CSS refactors.

### TypeScript Path Aliases

Configured in `tsconfig.json` — no relative `../..` imports anywhere in the codebase:

| Alias                  | Resolves To               |
| ---------------------- | ------------------------- |
| `@pages/*`             | `src/pages/*`             |
| `@config/*`            | `src/configuration/*`     |
| `@object-repository/*` | `src/object-repository/*` |
| `@utils/*`             | `src/utilities/*`         |
| `@calc-types/*`        | `src/types/*`             |

### Playwright Configuration

| Setting            | Local                     | CI                        |
| ------------------ | ------------------------- | ------------------------- |
| Workers            | 5                         | 2                         |
| Retries            | 0                         | 2                         |
| Reporters          | html + junit              | github + html + junit     |
| Trace              | on-first-retry            | on-first-retry            |
| Screenshot         | only-on-failure           | only-on-failure           |
| Video              | on-first-retry            | on-first-retry            |
| Test timeout       | 30 000 ms                 | 30 000 ms                 |
| Expect timeout     | 10 000 ms                 | 10 000 ms                 |
| Action timeout     | 15 000 ms                 | 15 000 ms                 |
| Navigation timeout | 30 000 ms                 | 30 000 ms                 |
| Viewport           | 1280 × 720                | 1280 × 720                |
| Browsers           | chromium, firefox, webkit | chromium, firefox, webkit |

### TypeScript Strict Mode

`tsconfig.json` enables maximal strictness:

```
strict, strictNullChecks, noImplicitAny,
exactOptionalPropertyTypes, noUncheckedIndexedAccess,
noUnusedLocals, noUnusedParameters, noEmit
```

### ESLint Rules

Flat config (`eslint.config.mjs`) layers three plugin configs:

- **`@typescript-eslint`** — `no-explicit-any`, `explicit-function-return-type`, `no-floating-promises`, `await-thenable`, `no-misused-promises`, `consistent-type-imports`, `naming-convention` (camelCase/PascalCase/UPPER_CASE), and more
- **`eslint-plugin-playwright`** — `no-wait-for-timeout`, `no-useless-await`, `prefer-web-first-assertions`, `max-nested-describe` (max: 2)
- **`eslint-plugin-security`** — `detect-eval-with-expression`, `detect-unsafe-regex`, `detect-object-injection`, `detect-possible-timing-attacks`

---

## Git Hooks

| Hook         | Trigger      | Action                                                                                               |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------- |
| `pre-commit` | `git commit` | Runs `lint-staged`: ESLint --fix + Prettier --write on `*.ts`; Prettier --write on `*.{json,yml,md}` |
| `commit-msg` | `git commit` | Runs `commitlint` to enforce Conventional Commits                                                    |

### Commit Convention

Enforced by `commitlint` (`@commitlint/config-conventional` + custom rules):

```
<type>(<scope>): <Subject>
```

| Field     | Rule                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------ |
| `type`    | One of: `feat`, `fix`, `test`, `chore`, `refactor`, `ci`, `docs`, `perf`, `style`, `build`, `security` |
| `scope`   | kebab-case                                                                                             |
| `subject` | Sentence-case, no trailing period                                                                      |
| `header`  | Max 100 characters                                                                                     |

---

## Test Cases

### Arithmetic Tests (16 cases)

| TC-ID        | Test Name                                                                                      | Tags                 | Priority |
| ------------ | ---------------------------------------------------------------------------------------------- | -------------------- | -------- |
| TC-ARITH-001 | Adding two positive integers (7 + 8) should display the correct sum of 15                      | `@smoke @regression` | P1       |
| TC-ARITH-002 | Adding zero to zero should display zero                                                        | —                    | P2       |
| TC-ARITH-003 | Adding two decimal numbers (1.5 + 2.5) should display the exact sum of 4                       | —                    | P2       |
| TC-ARITH-004 | Adding a large number near 1000 (999 + 1) should correctly cross the boundary and display 1000 | —                    | P2       |
| TC-ARITH-005 | Multiplying two positive integers (4 × 5) should display the correct product of 20             | `@smoke @regression` | P1       |
| TC-ARITH-006 | Multiplying any number by zero (7 × 0) should always produce zero                              | —                    | P2       |
| TC-ARITH-007 | Chaining three additions (1 + 2 + 4) should give the correct cumulative total of 7             | —                    | P2       |
| TC-ARITH-008 | Multiplication should take precedence over addition — 2 + 4 × 5 should display 22 not 30       | —                    | P2       |
| TC-ARITH-009 | Parentheses followed by multiplication returns only the grouped result — BUG-007 ⚠             | `@bug @regression`   | P1       |
| TC-ARITH-010 | Two parenthesised groups multiplied together only evaluates the first group — BUG-007 ⚠        | `@bug @regression`   | P1       |
| TC-ARITH-011 | Division operands are swapped — 8 ÷ 4 computes 4 ÷ 8 = 0.5 — BUG-004 ⚠                         | `@bug @regression`   | P1       |
| TC-ARITH-012 | The minus button appends "/" instead of "-" to the display — BUG-001 ⚠                         | `@bug @regression`   | P1       |
| TC-ARITH-013 | The digit button "3" incorrectly appends "0" to the display — BUG-002 ⚠                        | `@bug @regression`   | P1       |
| TC-ARITH-014 | Chaining the same addition three times (5 + 5 + 5) should accumulate to 15                     | —                    | P2       |
| TC-ARITH-015 | Multiplying large numbers (999 × 999) should display the correct product 998001                | —                    | P2       |
| TC-ARITH-016 | Subtracting two integers (5 − 3) should display 2 — FAILS while BUG-001 is open ⚠              | `@bug @regression`   | P1       |

### Scientific Function Tests (13 cases)

| TC-ID      | Test Name                                                                                           | Tags                 | Priority |
| ---------- | --------------------------------------------------------------------------------------------------- | -------------------- | -------- |
| TC-SCI-001 | Square root of a perfect square (√4) should display the exact integer result of 2                   | `@smoke @regression` | P1       |
| TC-SCI-002 | Square root of another perfect square (√9) should display the exact integer result of 3             | —                    | P1       |
| TC-SCI-003 | Square root of zero should display zero                                                             | —                    | P2       |
| TC-SCI-004 | Square root of a non-perfect square (√2) should display the full irrational result                  | —                    | P2       |
| TC-SCI-005 | Cosine of zero should display exactly 1 (cos 0° = 1)                                                | `@smoke @regression` | P1       |
| TC-SCI-006 | Tangent of zero should display exactly 0 (tan 0° = 0)                                               | —                    | P1       |
| TC-SCI-007 | Log base 10 of 100 should display 2 because 10² = 100                                               | —                    | P1       |
| TC-SCI-008 | Log base 10 of 1 should display 0 because 10⁰ = 1                                                   | —                    | P2       |
| TC-SCI-009 | The sin function always returns 1 regardless of input due to a hardcoded result — BUG-003 ⚠         | `@bug @regression`   | P1       |
| TC-SCI-010 | Entering sin(90) confirms the bug — sin returns 1 not the correct value near 0.893 — BUG-003 ⚠      | `@bug @regression`   | P1       |
| TC-SCI-011 | Applying a scientific function to an empty display should show an Error message                     | `@smoke`             | P2       |
| TC-SCI-012 | Applying cosine to a very large number (1000) should return a valid numeric result without crashing | —                    | P3       |
| TC-SCI-013 | Tangent of 90° is undefined — calculator should display Infinity or very large number, not crash    | —                    | P2       |

### Display Behaviour Tests (8 cases)

| TC-ID       | Test Name                                                                                          | Tags                 | Priority |
| ----------- | -------------------------------------------------------------------------------------------------- | -------------------- | -------- |
| TC-DISP-001 | The calculator display should show nothing when the page first loads                               | `@smoke @regression` | P1       |
| TC-DISP-002 | Pressing Clear after entering numbers should completely reset the display to empty                 | `@smoke @regression` | P1       |
| TC-DISP-003 | The display should update in real time showing each digit and operator as the user presses buttons | —                    | P1       |
| TC-DISP-004 | Evaluating an incomplete expression with a trailing operator (1+) should show an Error             | —                    | P1       |
| TC-DISP-005 | Pressing Clear multiple times in a row should keep the display consistently empty                  | —                    | P3       |
| TC-DISP-006 | Entering a number followed by the decimal button should show the trailing dot as "1."              | —                    | P2       |
| TC-DISP-007 | Opening and closing parentheses around a digit should appear correctly as "(5)"                    | —                    | P2       |
| TC-DISP-008 | The display field should be read-only and prevent direct keyboard input from users                 | `@smoke`             | P2       |

### Boundary and Edge Case Tests (15 cases)

| TC-ID        | Technique  | Test Name                                                                              | Tags               | Priority |
| ------------ | ---------- | -------------------------------------------------------------------------------------- | ------------------ | -------- |
| TC-BOUND-001 | EP-Valid   | Entering a single digit should evaluate to that same digit                             | `@smoke`           | P2       |
| TC-BOUND-002 | EP-Invalid | Pressing a scientific function on an empty display should show Error                   | `@smoke`           | P1       |
| TC-BOUND-003 | EP-Invalid | Entering only an operator without numbers should produce NaN                           | —                  | P2       |
| TC-BOUND-004 | BVA        | Entering the minimum boundary value of zero and evaluating should display zero         | —                  | P2       |
| TC-BOUND-005 | BVA        | Entering the value just above zero (1) should display 1                                | —                  | P2       |
| TC-BOUND-006 | BVA        | Entering a very large nine-digit number should be handled without overflow             | —                  | P2       |
| TC-BOUND-007 | BVA        | Entering a very small decimal (0.000001) should be displayed with full precision       | —                  | P2       |
| TC-BOUND-008 | DT         | 0 ÷ 5 shows Infinity because BUG-004 reverses operands making it 5 ÷ 0 ⚠               | `@bug @regression` | P1       |
| TC-BOUND-009 | DT         | 5 ÷ 0 shows 0 because BUG-004 reverses operands making it 0 ÷ 5 ⚠                      | `@bug @regression` | P1       |
| TC-BOUND-010 | DT         | Unclosed parenthesis "(5+2" silently computes 7 instead of showing Error — BUG-006 ⚠   | `@bug @regression` | P2       |
| TC-BOUND-011 | EG         | Double decimal point (1..5) silently evaluates to "1" instead of NaN/Error — BUG-008 ⚠ | `@bug @regression` | P3       |
| TC-BOUND-012 | EG         | Pressing equals multiple times in a row should not corrupt the calculator state        | —                  | P3       |
| TC-BOUND-013 | ST         | After showing an Error, pressing Clear should allow a fresh valid expression           | `@smoke`           | P1       |
| TC-BOUND-014 | ST         | A calculated result should remain visible until the user enters a new action           | —                  | P2       |
| TC-BOUND-015 | BVA        | Floating-point arithmetic (0.1 + 0.2) should produce a result very close to 0.3        | —                  | P2       |

### HTTP Security Header Tests (6 cases)

| TC-ID      | OWASP | Test Name                                                                                      | Priority |
| ---------- | ----- | ---------------------------------------------------------------------------------------------- | -------- |
| TC-SEC-001 | A05   | The page should include a Content-Security-Policy header to prevent injection attacks          | P1       |
| TC-SEC-002 | A05   | The page should prevent clickjacking by setting X-Frame-Options or a frame-ancestors directive | P1       |
| TC-SEC-003 | A05   | Every external script tag should have a Subresource Integrity (SRI) attribute                  | P2       |
| TC-SEC-004 | A05   | No JavaScript files should be loaded from unexpected third-party domains                       | P2       |
| TC-SEC-005 | A05   | The page should enforce HTTPS with a Strict-Transport-Security header                          | P2       |
| TC-SEC-006 | A05   | The page should include X-Content-Type-Options set to nosniff to prevent MIME-sniffing         | P3       |

### Client-Side Storage and Input Security Tests (6 cases)

| TC-ID      | OWASP | Test Name                                                                                 | Priority |
| ---------- | ----- | ----------------------------------------------------------------------------------------- | -------- |
| TC-SEC-007 | A02   | Browser localStorage should remain empty after calculations — no history stored locally   | P1       |
| TC-SEC-008 | A02   | Browser sessionStorage should remain empty after calculations — no session data written   | P1       |
| TC-SEC-009 | A09   | Triggering errors should not print stack traces or internal variable names to the console | P1       |
| TC-SEC-010 | A02   | Calculation results should not be exposed as data properties on the global window object  | P2       |
| TC-SEC-011 | A03   | Injecting an XSS script payload into the display should not cause any alerts to fire      | P1       |
| TC-SEC-012 | A08   | Setting the display to "**proto**" should not crash the application                       | P2       |

### Regression Tests — Known Defects (8 cases, all FAIL intentionally)

| TC-ID      | Bug     | Test Name                                                                                  | Priority    |
| ---------- | ------- | ------------------------------------------------------------------------------------------ | ----------- |
| TC-BUG-001 | BUG-001 | Clicking the minus button should append a subtraction sign, not a division slash           | P1 Critical |
| TC-BUG-002 | BUG-002 | Pressing the button labelled "3" should append the digit 3, not the digit 0                | P1 Critical |
| TC-BUG-003 | BUG-003 | Calculating sin of zero should display 0, not the hardcoded value 1                        | P1 High     |
| TC-BUG-004 | BUG-004 | Dividing 6 by 2 should display 3, not 0.333 — operands are swapped in the parser           | P1 High     |
| TC-BUG-005 | BUG-005 | Pressing equals on an empty display should show Error, not the raw text "undefined"        | P2 Medium   |
| TC-BUG-006 | BUG-006 | Evaluating "(5+2" without a closing parenthesis should show Error, not silently return 7   | P2 Medium   |
| TC-BUG-007 | BUG-007 | Entering (2+4)×5 should display 30 — the parser drops the multiplier and returns 6         | P1 Critical |
| TC-BUG-008 | BUG-008 | Entering "1..5" with a double decimal should show NaN or Error, not silently evaluate to 1 | P3 Low      |

---

## Test Design Approach

| Technique                         | Applied In                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| **Equivalence Partitioning (EP)** | `boundary.spec.ts` — valid/invalid input classes                                     |
| **Boundary Value Analysis (BVA)** | `boundary.spec.ts` — 0, 1, max float, min float, 0.1+0.2                             |
| **Decision Table**                | `boundary.spec.ts` — operator × operand combinations, div-by-zero                    |
| **State Transition**              | `boundary.spec.ts` + `display.spec.ts` — empty → expression → result → error → clear |
| **Error Guessing**                | `boundary.spec.ts` — double decimal, consecutive operators, rapid equals             |
| **Regression**                    | `bugs.spec.ts` — 8 tests asserting correct behaviour, all fail = bugs confirmed      |

---

## Bug Reports

Eight defects discovered through DOM forensic analysis, automated testing, and exploratory testing:

| ID      | Severity | Title                                                       | Report                                |
| ------- | -------- | ----------------------------------------------------------- | ------------------------------------- |
| BUG-001 | Critical | Minus button appends "/" — subtraction is completely absent | [BUG-001.md](reports/bugs/BUG-001.md) |
| BUG-002 | Critical | "3" button appends "0" — digit 3 is inaccessible            | [BUG-002.md](reports/bugs/BUG-002.md) |
| BUG-003 | High     | `sin()` always returns 1 due to a hardcoded XOR value       | [BUG-003.md](reports/bugs/BUG-003.md) |
| BUG-004 | High     | Division is reversed — `6÷2` computes `2÷6 = 0.333`         | [BUG-004.md](reports/bugs/BUG-004.md) |
| BUG-005 | Medium   | Pressing equals on empty display shows `"undefined"`        | [BUG-005.md](reports/bugs/BUG-005.md) |
| BUG-006 | Medium   | Unclosed parenthesis `(5+2` silently returns 7              | [BUG-006.md](reports/bugs/BUG-006.md) |
| BUG-007 | Critical | Parentheses + multiplication — `(2+4)×5` returns 6, not 30  | [BUG-007.md](reports/bugs/BUG-007.md) |
| BUG-008 | Low      | Double decimal `1..5` silently evaluates to `1`             | [BUG-008.md](reports/bugs/BUG-008.md) |

All 8 regression tests in `src/tests/regression/bugs.spec.ts` assert **correct expected behaviour**.
Every test intentionally **FAILS** against the current implementation — confirming all defects are
reproducible and testable.

---

## Security Coverage

| Test ID    | OWASP Category                  | Finding                                        |
| ---------- | ------------------------------- | ---------------------------------------------- |
| TC-SEC-001 | A05 — Security Misconfiguration | CSP header absent on GitHub Pages              |
| TC-SEC-002 | A05 — Security Misconfiguration | X-Frame-Options / frame-ancestors absent       |
| TC-SEC-003 | A05 — Security Misconfiguration | No SRI on linked scripts                       |
| TC-SEC-004 | A05 — Security Misconfiguration | Third-party script origin audit                |
| TC-SEC-005 | A05 — Security Misconfiguration | HSTS header present (GitHub Pages provides it) |
| TC-SEC-006 | A05 — Security Misconfiguration | X-Content-Type-Options absent                  |
| TC-SEC-007 | A02 — Cryptographic Failures    | localStorage empty post-calculation            |
| TC-SEC-008 | A02 — Cryptographic Failures    | sessionStorage empty post-calculation          |
| TC-SEC-009 | A09 — Security Logging Failures | No stack traces in console output              |
| TC-SEC-010 | A02 — Cryptographic Failures    | No calculation data leaked to window scope     |
| TC-SEC-011 | A03 — XSS                       | XSS payload in display does not execute        |
| TC-SEC-012 | A08 — Software/Data Integrity   | Prototype pollution probe does not crash app   |

---

## CI Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

Triggers on push and PR to `main`. Concurrent runs for the same ref are cancelled automatically.

```
push / PR → main
    ├── quality-check (ESLint + tsc + Prettier + ls-lint)  [timeout: 10 min]
    └── test (matrix: chromium / firefox / webkit)          [timeout: 30 min, needs: quality-check]
            ├── artifact: playwright-report-{browser}  (always, 30 days)
            ├── artifact: junit-results-{browser}      (always, 30 days)
            └── artifact: test-results-{browser}       (on failure, 7 days)
```

JUnit XML is written to `results/junit.xml` by the `junit` reporter in `playwright.config.ts`.

### Jenkins (`Jenkinsfile`)

Declarative pipeline — runs inside Docker containers built from the project's own `Dockerfile`.
The image pre-installs Playwright browsers into `/root/.cache/ms-playwright` before the workspace
is mounted, so browser binaries survive the Jenkins `deleteDir()` cleanup between stages.

```
push → Jenkins
    ├── Quality Check   [Dockerfile agent, --user root]
    │       sh 'npm ci && npm run quality:check'
    └── Playwright Tests  [parallel]
            ├── Chromium  [Dockerfile agent, --ipc=host --user root]
            │       sh 'npm ci && npx playwright test --project=chromium'
            │       junit 'results/junit.xml'
            │       archiveArtifacts 'playwright-report/**'
            ├── Firefox   [Dockerfile agent, --ipc=host --user root]
            └── WebKit    [Dockerfile agent, --ipc=host --user root]
```

Options: `timeout(60 min)`, `disableConcurrentBuilds()`, `buildDiscarder(keep 20 builds / 10 artifacts)`.

Required Jenkins plugins: **Docker Pipeline**, **JUnit** (both ship with suggested plugins).

---

## Docker

The `Dockerfile` produces a self-contained image with Node 20 + all three Playwright browser binaries.
Browser installation happens at image build time (not at runtime), so the workspace volume mount
does not evict browser caches.

```bash
# Build the image
npm run docker:build        # docker build -t sc-web-ui-automation .

# Run quality gates inside the container
npm run docker:quality      # docker run --rm sc-web-ui-automation npm run quality:check

# Run tests inside the container
npm run docker:test         # docker run --rm --ipc=host sc-web-ui-automation npm test
```

`--ipc=host` is required for Chromium (shared memory for renderer processes).

---

## Reports

After a test run:

```bash
# HTML report (Playwright built-in)
npx playwright show-report

# JUnit XML (for CI/CD integration, Jenkins, etc.)
cat results/junit.xml
```
