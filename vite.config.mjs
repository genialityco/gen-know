import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api-get-documents": {
        target: "http://documind.onrender.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api-get-documents/, "/api-get-documents"),
      },
      "/api-upload-file": {
        target: "http://documind.onrender.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api-upload-file/, "/api-upload-file"),
      },
      "/api-ask-from-collection": {
        target: "http://documind.onrender.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api-ask-from-collection/,
            "/api-ask-from-collection"
          ),
      },
      "/api-delete-document": {
        target: "http://documind.onrender.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api-delete-document/, "/api-delete-document"),
      },
      "/api-create-folder": {
        target: "http://documind.onrender.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api-create-folder/, "/api-create-folder"),
      },
      "/api-get-folders": {
        target: "http://documind.onrender.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api-get-folders/, "/api-get-folders"),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
});
