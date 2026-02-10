import { defineConfig } from "vite";

/**
 * - Vite code-splits dynamic imports automatically.
 * - CSS is extracted to separate files in build (cache-friendly).
 */
export default defineConfig({
  appType: 'spa',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || "chunk";
          if (name.startsWith("route__")) return `assets/${name}.[hash].js`;
          return "assets/[name].[hash].js";
        }
      }
    }
  }
});
