# Wall·E

<p align="center">
  <img src="assets/logo.jpg" alt="Wall·E" width="280" />
</p>

<p align="center">
  从零开始的桌面个人 Agent：陪你聊天，也帮你干活。
</p>

> **协作入口**：接手开发或给 AI 续作请先读 [HANDOFF.md](./HANDOFF.md)（架构、踩坑、下一步）。

## 这是什么

Wall·E 是一个 **Electron + React + TypeScript** 本地桌面个人助手。两种模式：

| 模式 | 做什么 | 技术（规划） |
|------|--------|----------------|
| **Chat** | 对话、问答、日常协作；消息可能含 Markdown / 图表 | [AI SDK](https://sdk.vercel.ai/) |
| **Work** | 写代码、跑命令、改仓库 | [Pi](https://pi.dev/) |

当前仓库已落地 **Codex 风格多栏 Agent shell**（mock 数据）；Chat / Work 后端尚未接入。

## 技术栈

| 层 | 选型 |
|----|------|
| 客户端 | [Electron](https://www.electronjs.org/) 桌面壳 |
| UI | React 19 + TypeScript + [HeroUI](https://heroui.com/) / [HeroUI Pro](https://heroui.pro/) |
| 主题 | 自定义 **Uber**（`src/renderer/themes/uber.css`，`data-theme="uber" \| "uber-dark"`） |
| 微交互 | [GSAP](https://gsap.com/) + `@gsap/react` |
| 构建 | Vite + Tailwind CSS v4 + `vite-plugin-electron` |
| 逻辑 | 纯 TS domain（`src/shell/*`、`src/mock/*`、`src/core.ts`） |
| 图标 | [lucide-react](https://lucide.dev/) |
| Mock | `@faker-js/faker` 仅用于生成 `src/mock/fixtures.ts` |

> 历史 Native SDK（`.native` / Zig）产物若仍在仓库中，**不再是**开发与启动主路径。

### Agent skills（设计 / 动效）

| Skill | 用途 |
|-------|------|
| `heroui-react-pro` / `heroui-pro-design-taste` | HeroUI 组件与设计品味 |
| `impeccable` | 界面设计 critique / polish（`npx impeccable install`） |
| `gsap-*` | GSAP 微交互（`npx skills add https://github.com/greensock/gsap-skills`） |

项目内见 `.agents/skills/`。HeroUI Pro 包安装需已登录：`npx heroui-pro login`（**勿**把 personal token 写进仓库）。

## 目录结构

```
.
├── electron/                  # Electron main + preload
├── index.html                 # Renderer 入口 HTML
├── package.json
├── vite.config.ts
├── scripts/
│   └── generate-mock.mjs      # faker → fixtures
├── src/
│   ├── core.ts                # Domain 对外 surface
│   ├── shell/                 # 纯逻辑（reduce / selectors / theme / composer）
│   ├── mock/                  # fixtures + selection
│   └── renderer/              # React UI（三栏 shell）
└── assets/
    ├── icon.png
    └── logo.jpg
```

## 开发循环

先决条件：**Node.js ≥ 20**（推荐 22+）。**不需要** Zig、`native` CLI 或 `@native-sdk/*`。  
包管理推荐 **pnpm**（HeroUI Pro CLI 会用它装 peer deps）；`npm` 亦可。

```sh
pnpm install      # 或 npm install
# 首次或换机装 HeroUI Pro 制品（需已 heroui-pro login）：
npx heroui-pro install --yes

pnpm dev          # Vite + Electron 开发窗口
pnpm start        # 启动已构建的 Electron 应用（需先 build）
pnpm build        # 构建 renderer + electron 主进程
pnpm test         # vitest：selection + reduce 纯逻辑单测
pnpm typecheck    # TypeScript 检查
```

### Mock 数据

```sh
npm run generate:mock   # 或 node scripts/generate-mock.mjs
```

## 验证

```sh
npm test          # 必须绿：exercises shipped selection + reduce
npm run build     # 必须成功：产出 dist/ + dist-electron/
npm run dev       # 打开多栏 mock shell
```

## License

待定。
