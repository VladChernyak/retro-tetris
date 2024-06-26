import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "/retro-tetris/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
