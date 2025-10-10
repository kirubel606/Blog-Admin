import { defineConfig, loadEnv } from "vite"   // ✅ loadEnv added
import react from "@vitejs/plugin-react"
import path from "path"

export default ({ mode }) => {
  // Load env vars based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), "")
  const backendUrl = env.VITE_API_BASE_URL   // ✅ comes from .env file

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      hmr: false,
      host: "0.0.0.0",   // listen on all interfaces
      port: 5174,
      allowedHosts: ["aii.et", "localhost"],  // just hostnames
      proxy: {
        "/media": {
          target: backendUrl,  // ✅ now safe
          changeOrigin: true,
          secure: false,
          onProxyRes(proxyRes) {
            if (proxyRes.headers["x-frame-options"]) {
              delete proxyRes.headers["x-frame-options"]
            }
          },
        },
      },
    },
  })
}
