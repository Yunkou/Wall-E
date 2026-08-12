# Wall·E

<p align="center">
  <img src="assets/logo.jpg" alt="Wall·E" width="280" />
</p>

<p align="center">
  从零开始的桌面个人 Agent：陪你聊天，也帮你干活。
</p>

## 这是什么

Wall·E 是一个本地桌面个人助手。两种模式：

| 模式 | 做什么 | 技术 |
|------|--------|------|
| **Chat** | 对话、问答、日常协作；消息可能含 Markdown / 图表 | [AI SDK](https://sdk.vercel.ai/) + [Beautiful Mermaid](https://agents.craft.do/mermaid) |
| **Work** | 写代码、跑命令、改仓库 | [Pi](https://pi.dev/) |

Chat 负责轻量交互；Work 把任务交给 [Pi coding agent](https://pi.dev/)，由它在本地环境里真正执行。

## 技术栈

| 层 | 选型 |
|----|------|
| 客户端 | [Native SDK](https://native-sdk.dev/)（原生桌面窗口，非 WebView） |
| 运行时 | [Bun](https://bun.sh/) |
| UI | [HeroUI Pro](https://heroui.pro/) |
| Icons | [LobeHub Icons](https://icons.lobehub.com/)（模型 / 品牌 SVG，按需） |
| Chat | [AI SDK](https://sdk.vercel.ai/) |
| Markdown / 图表 | [Beautiful Mermaid](https://agents.craft.do/mermaid)（Chat 内 Mermaid 渲染，按需） |
| Work | [Pi](https://pi.dev/) |

## 目录结构

脚手架由 [Native SDK CLI](https://www.npmjs.com/package/@native-sdk/cli) 在仓库根目录就地生成（`native init .`），未拆 monorepo：

```
.
├── app.zon          # 应用清单：窗口、权限、图标、能力
├── package.json     # 仅给编辑器/TS 用，CLI 不读、不参与构建
├── tsconfig.json    # 与内置 checker 同选项，编辑器诊断 = `native check` 结果
├── src/
│   ├── app.native   # 视图：声明式 markup，绑定 Model 字段
│   └── core.ts      # 逻辑：Model / Msg / update，纯 TS，编译期到原生
├── assets/
│   ├── logo.jpg     # 项目品牌图
│   └── icon.png     # 应用图标（Native SDK 使用）
└── .gitignore       # 忽略 .native/、zig-out/、.zig-cache/、node_modules/
```

> TypeScript 前端与 core 编译器在构建期跑，发布后的二进制里**没有** JS 运行时。

## 开发循环

先决条件：[Node.js](https://nodejs.org/) ≥ 22.15（CLI 与 core checker 需要），
[Zig](https://ziglang.org/) ≥ 0.14（`native build` 编译原生二进制；不在 PATH 时 `native dev` 会给出安装指引）。

```sh
# 安装 CLI（如未安装）
npm install -g @native-sdk/cli

# 1) 编辑 src/core.ts → 改 Model/Msg/update
# 2) 编辑 src/app.native → 改视图绑定
# 3) 编辑 app.zon → 改窗口/权限/图标

native check        # 验证 core.ts (subset) + 全部 *.native + app.zon，毫秒级
native dev --core   # 在 node 里跑 core 循环，JSON 行派发 Msg，最快的逻辑验证
native dev          # 构建 Debug 二进制并启动原生窗口（markup 热重载）
native build        # ReleaseFast 二进制 → zig-out/bin/wall-e
native test         # 跑应用自带测试集
```

跑一次核心循环的样例：

```sh
printf '%s\n' '{"kind":"increment"}' '{"kind":"toggle_ticking"}' '{"advance":3000}' \
  | native dev --core
```

## Scaffold 出处

`src/app.native` 与 `src/core.ts` 默认是 **counter / tick / stamp** 三件套示例（来自
`native init`），用来验证脚手架能跑通；后续会把 `app.native` 改成真正承载 Chat 与
Work 两个面板的桌面壳，core 换成接 AI SDK / Pi 的状态机。

## Agent Skills

开发时给 coding agent 用，按职责归类。HeroUI 相关见 [Agent Skills](https://heroui.pro/docs/react/getting-started/agent-skills)。

| 类别 | Skill | 作用 |
|------|-------|------|
| **组件选型** | [`heroui-react-pro`](https://heroui.pro/docs/react/getting-started/agent-skills) | 按场景选对 `@heroui-pro/react` 组件，遵循 v3 用法 |
| **组件美感** | [`heroui-pro-design-taste`](https://heroui.pro/docs/react/getting-started/agent-skills) | 间距、字体、色彩、卡片与表单等设计原则，提升观感 |
| **界面设计** | [Impeccable](https://impeccable.style/) | 辅助客户端整体视觉，去 AI 默认审美 |

## 状态

仓库已铺好 Native SDK 脚手架（counter 占位逻辑 + 单窗口）。当前 Node 环境是 v22.11.0，
低于 Native SDK 的 22.15 要求；升级后再 `native check` / `native dev` 验证骨架。

## License

待定。
