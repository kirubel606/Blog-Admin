import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,       // Allow access from network (bind to 0.0.0.0)
    port: 3000,        // Change this to whatever port you want
    strictPort: true,  // Optional: fail if port is already in use
  },
})
