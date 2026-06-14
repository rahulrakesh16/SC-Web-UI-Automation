FROM node:20

# Install Playwright browser binaries and all OS-level dependencies.
# Browsers land in /root/.cache/ms-playwright and persist in this image layer,
# so the Jenkins workspace mount (which replaces /app) does not evict them.
COPY package*.json /tmp/playwright-install/
RUN cd /tmp/playwright-install && \
    npm ci && \
    npx playwright install --with-deps chromium firefox webkit && \
    rm -rf /tmp/playwright-install

WORKDIR /app
