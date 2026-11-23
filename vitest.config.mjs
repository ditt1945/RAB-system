import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Alias "@/..." sama dengan jsconfig.json supaya modul aplikasi bisa diuji langsung
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['tests/**/*.test.js'] },
});
