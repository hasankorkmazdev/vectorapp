import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_BASE_URL || "https://localhost:7142";
  const backendOrigin = apiUrl.replace(/\/api\/?$/, "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 8080,
      strictPort: true,
      proxy: {
        "/uploads": {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
