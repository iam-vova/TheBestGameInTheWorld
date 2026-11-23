import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // относительные пути: сборка работает и на GitHub Pages в подпапке, и в артефакте
  base: './',
  plugins: [vue()],
  resolve: { alias: { '@': '/src' } },
  test: { include: ['tests/**/*.test.ts'] },
});
