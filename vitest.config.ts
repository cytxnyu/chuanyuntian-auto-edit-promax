import {defineConfig} from 'vitest/config';

// Vendored upstream repos retain their own tests/toolchains (including Bun).
// The host suite tests our integrations, not unrelated upstream website apps.
export default defineConfig({test: {include: ['packages/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'], testTimeout: 30000, hookTimeout: 30000}});
