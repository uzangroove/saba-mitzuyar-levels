import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 3000 },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('phaser')) return 'phaser';
        },
      },
    },
  },
});
