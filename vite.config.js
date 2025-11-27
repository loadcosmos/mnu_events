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
      host: 'localhost',  // Явно указать хост для HMR
      protocol: 'ws',     // Явно указать протокол
    },
  },
  build: {
    outDir: '../dist', // Собираем в dist в корне проекта
    sourcemap: false, // Отключаем sourcemaps в production для уменьшения размера
    target: 'esnext', // Использовать современный ES
    chunkSizeWarningLimit: 500, // Лимит предупреждения о размере чанка (уменьшен с 1000)
    rollupOptions: {
      output: {
        // Улучшенный code splitting для оптимальной загрузки
        manualChunks: {
          // React core - базовые библиотеки React
          'react-core': ['react', 'react-dom'],

          // Router - отдельный chunk для роутинга
          'react-router': ['react-router-dom'],

          // UI библиотеки - компоненты UI
          'ui-libs': ['@radix-ui/react-select', 'lucide-react', 'sonner'],

          // Charts - библиотека для графиков (используется только в analytics)
          'charts': ['recharts'],

          // QR code - библиотеки для QR кодов (используется только в scanner)
          'qr-code': ['html5-qrcode', 'qrcode'],

          // Utils - утилиты и вспомогательные библиотеки
          'utils': ['axios', 'dompurify', 'clsx', 'class-variance-authority', 'tailwind-merge'],
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
