
# 🚀 AI Project Canvas & Gantt Generator

**基于 Next.js 15 与 Vercel AI SDK 构建的现代化 AI 驱动项目规划与甘特图生成系统**

[✨ 在线预览 Demo](https://ai-gantt-canvas-d9fj.vercel.app/) · [🐛 提交 Issue](https://github.com/你的用户名/ai-gantt-canvas/issues) · [💡 贡献代码](https://github.com/你的用户名/ai-gantt-canvas/pulls)


---

## 📖 项目简介 (Overview)

**AI Project Canvas** 是一款面向现代工程团队与独立开发者的 AI 原生项目管理辅助工具。它抛弃了传统枯燥的纯文本聊天框，采用类似 Claude Artifacts 的**左右分屏交互架构**：左侧提供流畅的大模型流式对话与意图解析，右侧通过 **Tool Calling + Zod 强类型校验** 实时渲染出结构化的项目阶段与甘特图看板。

本项目旨在探索大模型在复杂结构化数据生成与动态 UI 交互（Generative UI）方面的工程落地边界。

---

## ✨ 核心特性 (Key Features)

- **⚡ 极致流畅的流式传输 (Streaming)：** 基于 Next.js App Router 与 Vercel AI SDK，实现毫秒级打字机响应与 SSE 状态同步。
- **🛠️ 强类型的 Tool Calling：** 利用 `Zod` 定义严苛的 Schema 约束，确保大模型自主触发工具时输出 100% 合规的 JSON 数据结构。
- **📐 现代分屏交互画布 (Split Canvas)：** 融合 `react-resizable-panels` 与 `shadcn/ui`，支持拖拽调节视野，提供沉浸式的工作流体验。
- **📦 一键数据持久化与导出：** 支持将生成的项目阶段、任务节点与负责人详情一键导出为标准 JSON 格式。
- **☁️ 零成本极速部署：** 完美适配 Vercel Serverless 架构，开箱即用。

---

## 🛠️ 技术栈 (Tech Stack)

- **前端/全栈框架：** [Next.js 15 (App Router)](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **UI 组件库：** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
- **AI 编排 SDK：** [Vercel AI SDK (`ai` / `@ai-sdk/react`)](https://sdk.vercel.ai/)
- **数据结构校验：** [Zod](https://zod.dev/)
- **后端/大模型接入：** OpenAI 兼容规范 (支持 DeepSeek-R1 / Qwen 2.5 / 硅基流动等)

---

## 📂 项目结构 (Project Structure)

```tree
ai-gantt-canvas/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts     # AI 服务端 API Route (含 streamText 与 Tool 注册)
│   │   ├── globals.css          # 全局样式与 Tailwind 配置
│   │   └── page.tsx             # 客户端主页面 (分屏布局与 useChat 钩子)
│   ├── components/
│   │   └── ui/                  # shadcn 基础原子组件 (Button, Input, Resizable 等)
│   └── lib/
│       └── schema.ts            # 集中定义的 Zod 强类型 Schema
├── .env.local                   # 环境变量配置文件 (Git 忽略)
├── package.json
└── tsconfig.json
