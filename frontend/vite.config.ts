import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    // Required due to use of dynamic imports in Neuroglancer.
    format: "es",
  },
  build: {
    assetsDir: "",
    rollupOptions: {
      output: {
        format: "esm",
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;
          if (name?.endsWith(".html")) {
            return "[name][extname]";
          }
          return "[name]-[hash][extname]";
        },
      },
    },
  },
})
