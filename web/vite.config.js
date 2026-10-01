/* global process */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    clearMocks: true,
  },
  server: {
    proxy: {
      "/api": process.env.VITE_API_PROXY_TARGET || "http://localhost:3000",
    },
  },
});
