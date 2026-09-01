<h1 align="center">Spike zone · 毕航驰的 3D 个人简历</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/three.js-r169-000000?style=flat&logo=three.js&logoColor=white" alt="three.js">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite 5">
  <a href="https://bihangchi9-creator.github.io/bihangchi-web/"><img src="https://img.shields.io/badge/live-demo-brightgreen?style=flat" alt="Live Demo"></a>
</p>

<p align="center"><b>滚动即运镜，把简历长在一个 3D 场景里。</b></p>

<p align="center">
  <a href="https://bihangchi9-creator.github.io/bihangchi-web/">🌐 在线访问</a>
</p>

我是 **毕航驰（Spike）**，目前在字节跳动做模型运营，方向是把业务 SOP 沉淀为可复用的 AI 能力（Skill / Harness / 垂类 Agent）。

这是我的个人 3D 简历网站：一层随滚动运镜的 3D 人物背景 + 一层可滚动的内容（About → 履历 → 作品集）。纯前端 SPA，构建产物是静态文件，部署在 GitHub Pages。

## 内容一览

- **首屏**：3D 人物 + 个人信息
- **履历**：大连理工大学 → 字节跳动 · 模型运营 → 大连崇振时代 / 现代汽车实习 → 开源
- **作品集**：字节 · 模型运营的项目、开源项目（[dsh-lark-bridge](https://github.com/bihangchi9-creator/dsh-lark-bridge) / [trae-to-lark](https://github.com/bihangchi9-creator/trae-to-lark)）、实习作品

## 本地运行

前端应用在 [`web/`](web) 下，命令都在 `web/` 里执行：

```bash
cd web
npm install
npm run dev        # 开发 http://localhost:5173
npm run build      # 类型检查 + 打包到 dist/
```

**环境要求**：Node.js 20+。无后端、无数据库、无需 API key。

## 部署

推送到 `main` 分支即通过 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 自动构建并发布到 GitHub Pages。也可把 `web/dist/` 部署到任意静态托管（Cloudflare Pages / Netlify / Vercel 等）。

## 技术栈

React 18 · TypeScript · @react-three/fiber · @react-three/drei · @react-three/postprocessing · three.js · framer-motion · zustand · Vite

## 致谢与许可

- 本项目基于开源模板 **[sen-3d-resume](https://github.com/dayinji/sen-3d-resume)**（作者 [Sen Zheng](https://github.com/dayinji)）二次开发，**代码遵循 [MIT](LICENSE) 许可**，在此致谢。
- 站内的**个人内容与素材**（姓名、人物模型、简历、作品、文案）均为本人所有；原模板作者的个人内容已全部替换。
- 第三方素材（字体 / HDR）请各自核对其原始许可。
