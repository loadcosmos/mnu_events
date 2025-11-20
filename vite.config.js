import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: './frontend', // Указываем, что frontend - это корень проекта для Vite
  publicDir: 'public', // Папка public относительно root (frontend/public)
  plugins: [react()],
  server: {
    port: 5173, // Стандартный порт Vite
    open: true,
    host: '0.0.0.0', // Разрешить доступ с других устройств в сети
    hmr: {
      overlay: true, // Показывать overlay с ошибками
    },
  },
  build: {
    outDir: '../dist', // Собираем в dist в корне проекта
    sourcemap: true,
    target: 'esnext', // Использовать современный ES
    chunkSizeWarningLimit: 1000, // Лимит предупреждения о размере чанка
    rollupOptions: {
      output: {
        // Code splitting для оптимизации bundle
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'react-icons': ['react-icons'],
        },
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './frontend/js'),
      '@components': path.resolve(__dirname, './frontend/js/components'),
      '@services': path.resolve(__dirname, './frontend/js/services'),
      '@context': path.resolve(__dirname, './frontend/js/context'),
      '@pages': path.resolve(__dirname, './frontend/js/pages'),
      '@css': path.resolve(__dirname, './frontend/css'),
    },
  },
});
