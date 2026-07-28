// ره‌نگار — تنظیمات build فرانت‌اند (Vue 3 + Vite)
// خروجی آماده به static/dist/ می‌رود؛ اجرای نهایی همچنان فقط «python app.py» است.
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  base: '/static/dist/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: fileURLToPath(new URL('../static/dist', import.meta.url)),
    emptyOutDir: true,
    manifest: true,
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        'shell':         fileURLToPath(new URL('./src/shell/entry.js', import.meta.url)),
        'login':         fileURLToPath(new URL('./src/pages/login/entry.js', import.meta.url)),
        'dashboard':     fileURLToPath(new URL('./src/pages/dashboard/entry.js', import.meta.url)),
        'activities':    fileURLToPath(new URL('./src/pages/activities/entry.js', import.meta.url)),
        'activity-form': fileURLToPath(new URL('./src/pages/activity-form/entry.js', import.meta.url)),
        'activity-view': fileURLToPath(new URL('./src/pages/activity-view/entry.js', import.meta.url)),
        'users':         fileURLToPath(new URL('./src/pages/users/entry.js', import.meta.url)),
        'user-form':     fileURLToPath(new URL('./src/pages/user-form/entry.js', import.meta.url)),
        'domains':       fileURLToPath(new URL('./src/pages/domains/entry.js', import.meta.url)),
        'fields':        fileURLToPath(new URL('./src/pages/fields/entry.js', import.meta.url)),
        'reports':       fileURLToPath(new URL('./src/pages/reports/entry.js', import.meta.url)),
        'import':        fileURLToPath(new URL('./src/pages/import/entry.js', import.meta.url)),
        'settings':      fileURLToPath(new URL('./src/pages/settings/entry.js', import.meta.url)),
        'tasks':         fileURLToPath(new URL('./src/pages/tasks/entry.js', import.meta.url)),
        'report-print':  fileURLToPath(new URL('./src/pages/report-print/entry.js', import.meta.url)),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'shared/[name]-[hash].js',
        assetFileNames: (a) => (a.name && a.name.endsWith('.css') ? 'css/[name][extname]' : 'assets/[name]-[hash][extname]'),
      },
    },
  },
});
