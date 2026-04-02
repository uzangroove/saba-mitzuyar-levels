import { defineConfig } from 'vite';

export default defineConfig({
  base: '/saba-mitzuyar-levels/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('phaser')) return 'phaser';
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
