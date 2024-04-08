import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // 优先识别 main，如果没有配置 main，则识别 module
    mainFields: ['main', 'module', 'exports'],
  },
  test: {
    globals: true,
    mockReset: false,
    silent: process.env.CI === 'true',
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'text', 'html', 'clover', 'json'],
    },
  },
});
