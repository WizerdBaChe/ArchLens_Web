import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages 部署時，GITHUB_REPOSITORY 環境變數由 Actions 自動注入
// 格式為 "username/repo-name"，取 repo-name 作為 base path
// 本機開發（無此變數）保持 '/' 即可
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = repoName ? `/${repoName}/` : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
})
