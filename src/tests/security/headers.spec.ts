// OWASP A05: Security Misconfiguration

import { expect, test } from '@config/global-test-options';
import { BASE_URL } from '@utils/constants';

const CALCULATOR_ORIGIN = 'rbihubcodechallenge.github.io';

test.describe('HTTP Security Headers', () => {
  test(
    'TC-SEC-001: The calculator page should include a Content-Security-Policy header to prevent injection attacks',
    { tag: ['@owasp-a05', '@smoke', '@P1'] },
    async ({ request }) => {
      await test.step('Fetch the calculator page and assert the CSP header is present', async () => {
        const response = await request.get(BASE_URL);
        const cspHeader = response.headers()['content-security-policy'];
        expect(
          cspHeader,
          'Content-Security-Policy header is absent — HIGH severity finding for banking application',
        ).toBeTruthy();
      });
    },
  );

  test(
    'TC-SEC-002: The calculator page should prevent clickjacking by setting X-Frame-Options or a frame-ancestors CSP directive',
    { tag: ['@owasp-a05', '@smoke', '@P1'] },
    async ({ request }) => {
      await test.step('Check response headers for X-Frame-Options or frame-ancestors CSP directive', async () => {
        const response = await request.get(BASE_URL);
        const headers = response.headers();
        const xFrameOptions = headers['x-frame-options'];
        const cspHeader = headers['content-security-policy'] ?? '';
        const hasFrameAncestors = cspHeader.includes('frame-ancestors');
        const isProtected = !!xFrameOptions || hasFrameAncestors;
        expect(
          isProtected,
          'Neither X-Frame-Options nor frame-ancestors CSP directive found — clickjacking risk',
        ).toBe(true);
      });
    },
  );

  test(
    'TC-SEC-003: Every external script tag on the page should have a Subresource Integrity (SRI) attribute to prevent tampering',
    { tag: ['@owasp-a05', '@P2'] },
    async ({ page }) => {
      await test.step('Collect all external script tags and verify each has an integrity attribute', async () => {
        const externalScripts: { src: string; hasIntegrity: boolean }[] = await page.evaluate(
          (origin) => {
            return Array.from(document.querySelectorAll('script[src]'))
              .filter((s) => {
                const src = (s as HTMLScriptElement).src;
                return src && !src.includes(origin);
              })
              .map((s) => ({
                src: (s as HTMLScriptElement).src,
                hasIntegrity: (s as HTMLScriptElement).hasAttribute('integrity'),
              }));
          },
          CALCULATOR_ORIGIN,
        );

        for (const script of externalScripts) {
          expect(
            script.hasIntegrity,
            `External script '${script.src}' is missing integrity (SRI) attribute`,
          ).toBe(true);
        }
      });
    },
  );

  test(
    'TC-SEC-004: No JavaScript files should be loaded from unexpected third-party domains during page load',
    { tag: ['@owasp-a05', '@P2'] },
    async ({ page }) => {
      const unexpectedOrigins: string[] = [];

      await test.step('Intercept network requests and capture any scripts from unexpected origins', async () => {
        page.on('request', (req) => {
          if (req.resourceType() === 'script') {
            const url = req.url();
            if (!url.includes(CALCULATOR_ORIGIN) && !url.startsWith('data:')) {
              unexpectedOrigins.push(url);
            }
          }
        });

        await page.goto(BASE_URL);
        await page.locator("//input[@id='display']").waitFor({ state: 'visible', timeout: 30000 });
      });

      await test.step('Assert no scripts were loaded from unexpected third-party origins', () => {
        expect(
          unexpectedOrigins,
          `Scripts from unexpected origins: ${unexpectedOrigins.join(', ')}`,
        ).toHaveLength(0);
      });
    },
  );

  test(
    'TC-SEC-005: The calculator page should enforce HTTPS by including a Strict-Transport-Security header',
    { tag: ['@owasp-a05', '@P2'] },
    async ({ request }) => {
      await test.step('Fetch the page and assert the HSTS header is present', async () => {
        const response = await request.get(BASE_URL);
        const hsts = response.headers()['strict-transport-security'];
        expect(hsts, 'Strict-Transport-Security header absent — HTTPS downgrade risk').toBeTruthy();
      });
    },
  );

  test(
    'TC-SEC-006: The calculator page should include an X-Content-Type-Options header set to nosniff to prevent MIME-sniffing attacks',
    { tag: ['@owasp-a05', '@P3'] },
    async ({ request }) => {
      await test.step('Fetch the page and assert X-Content-Type-Options is set to nosniff', async () => {
        const response = await request.get(BASE_URL);
        const header = response.headers()['x-content-type-options'];
        expect(header, 'X-Content-Type-Options header absent — MIME-sniffing risk').toBe('nosniff');
      });
    },
  );
});
