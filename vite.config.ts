import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@background": fileURLToPath(new URL("./src/background", import.meta.url)),
      "@content": fileURLToPath(new URL("./src/content", import.meta.url)),
      "@devtools": fileURLToPath(new URL("./src/devtools", import.meta.url)),
      "@panel": fileURLToPath(new URL("./src/panel", import.meta.url)),
      "@theme": fileURLToPath(new URL("./src/theme", import.meta.url)),
    },
  },
});
