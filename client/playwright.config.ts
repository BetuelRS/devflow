import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    { command: 'npm run dev -w server', port: 3001, cwd: rootDir, timeout: 15000, reuseExistingServer: true },
    { command: 'npm run dev -w client', port: 5173, cwd: rootDir, timeout: 15000, reuseExistingServer: true },
  ],
});
