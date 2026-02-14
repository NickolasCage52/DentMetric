import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.js', 'src/**/*.test.js', 'tests/**/*.spec.js', 'tests/**/*.test.js'],
  },
});
