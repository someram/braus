import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
  server: { proxy: { "/api": "http://localhost:3001" } },
})
