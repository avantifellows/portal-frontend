// Use CommonJS syntax to ensure compatibility across environments
const { defineConfig } = require("vite");
const path = require("path");
const vue = require("@vitejs/plugin-vue");

// CommonJS module exports
module.exports = defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
  },
  base: "",
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue"],
        },
      },
    },
  },
});
