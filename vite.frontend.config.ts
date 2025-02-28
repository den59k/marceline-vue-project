import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-ignore
import path from 'path'
import { vueSvgPlugin } from '@den59k/vite-utils'

const env = loadEnv('mock', process.cwd(), '')
const server = env["PROXY"] ?? "http://localhost:3001"

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/frontend",
  plugins: [vue(), vueSvgPlugin() as any],
  server: {
    proxy: {
      "^/api/(?!.*[.]ts).*$": server,
      "/uploads": server
    }
  },
  build: {
    outDir: path.join(__dirname, "./dist/frontend"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("monaco-editor")) {
            return "monaco-editor"
          }
        }
      }
    }
  },
})
