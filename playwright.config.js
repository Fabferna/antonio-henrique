// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:4173',
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
        { name: 'mobile', use: { ...devices['Pixel 7'] } }
    ],
    webServer: {
        command: 'node tests/serve.js',
        url: 'http://localhost:4173',
        reuseExistingServer: true
    }
});
