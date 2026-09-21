import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import artifacts from './qa/artifacts.mjs'

export default defineConfig({
  // 打包后资源用相对路径（dist/index.html 引用 ./assets/...，可放任意子目录/直接打开）
  base: './',
  plugins: [react(), artifacts],
  server: { host: true, port: 5173 },
})
