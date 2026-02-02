import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Tauri環境でのクリアなコンソール出力
  clearScreen: false,

  // Tauri開発サーバーのポート
  server: {
    port: 5173,
    strictPort: true,
  },
});
