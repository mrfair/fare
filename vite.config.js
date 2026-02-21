import { defineConfig } from "vite";
import { resolve } from "path";

const SW_ENTRY = resolve(__dirname, "src/sw.ts");

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
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        sw: SW_ENTRY
      },
      output: {
        entryFileNames: (chunkInfo) => (chunkInfo.name === "sw" ? "sw.js" : "assets/[name].[hash].js"),
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || "chunk";
          if (name.startsWith("route__")) return `assets/${name}.[hash].js`;
          return "assets/[name].[hash].js";
        }
      }
    }
  }
});
